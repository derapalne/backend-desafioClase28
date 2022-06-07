import "dotenv/config";

// [ --------- IMPORTS LOCALES --------- ] //
import ArchivadorProductos from "./src/daos/archivadorDaoProductos.js";
import { optionsMariaDB } from "./src/options/mariaDB.js";
import ArchivadorMensajes from "./src/daos/archivadorDaoMensajes.js";
import { optionsSQLite } from "./src/options/SQLite3.js";
import Mocker from "./src/utils/mocker.js";
const mocker = new Mocker();
import inicializarProductos from "./src/utils/init.js";
import routerRandom from "./src/routes/randomsRoute.js";

// [ --------- MIDDLEWARE --------- ] //

import { isLogged } from "./src/middlewares/isLogged.js";

// [ --------- IMPORTS NPM --------- ] //

// >>>>>Express & Session
import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
// >>>>>Socket
import { Server as HttpServer } from "http";
import { Server as IOServer } from "socket.io";
// >>>>>MongoDB
import MongoStore from "connect-mongo";
import { advancedOptions } from "./src/daos/DaoUsuariosMongoDB.js";
// >>>>>Passport
import "./src/middlewares/local-auth.js";
import passport from "passport";
// >>>>>Flash
import flash from "connect-flash";
// >>>>>Minimist
import parseArgs from "minimist";
import { parse } from "path";

// [ --------- CONFIGURACION --------- ] //

// >>>>>Servidor
const app = express();
const httpServer = new HttpServer(app);
const io = new IOServer(httpServer);

// >>>>>Middleware, Cookies y Sesiones
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
    session({
        store: MongoStore.create({
            mongoUrl: process.env.MONGO_URI,
            mongoOptions: advancedOptions,
        }),
        secret: "andywarhol",
        resave: false,
        rolling: true,
        saveUninitialized: false,
        cookie: {
            maxAge: 600000,
        },
    })
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use('/api/random', routerRandom);

app.use((err, req, res, next) => {
    app.locals.registerMessage = req.flash("registerMessage");
    app.locals.loginMessage = req.flash("loginMessage");
    app.locals.email = req.flash("email");
    console.log(err);
    // Acá traté de manejar los 404 not found pero no entendí muy bien cómo :p
    if (err instanceof NotFound) {
        res.render("404");
    } else {
        next(err);
    }
});

// >>>>>DBs
const archMensajes = new ArchivadorMensajes("chat", optionsSQLite);
archMensajes.chequearTabla();
const archProductos = new ArchivadorProductos("productos", optionsMariaDB);
archProductos.chequearTabla();

// >>>>>Motor de plantillas
app.use(express.static("./public"));
app.set("views", "./src/views");
app.set("view engine", "ejs");

// >>>>>Inicializador : descomentar si es necesario

//inicializarProductos(archProductos);

// [ --------- RUTAS --------- ] //

app.get("/", isLogged, async (req, res) => {
    try {
        const productos = await archProductos.getAll();
        const mensajes = await archMensajes.read();
        res.status(200).render("productosForm", {
            prods: productos,
            mensajes: mensajes,
            email: req.user.email,
        });
    } catch (e) {
        res.status(500).send(e);
    }
});

app.get("/api/productos-test", async (req, res) => {
    try {
        const productos = mocker.generarProductos(5);
        const mensajes = await archMensajes.read();
        res.status(200).render("productosForm", {
            prods: productos,
            mensajes: mensajes,
        });
    } catch (e) {
        res.status(500).send(e);
    }
});

app.get("/login", (req, res) => {
    try {
        if (req.isAuthenticated()) {
            res.redirect("/");
        } else {
            res.status(200).render("login");
        }
    } catch (e) {
        res.status(500).send(e);
    }
});

app.get("/register", (req, res) => {
    if (req.isAuthenticated()) {
        res.status(200).redirect("/");
    }
    res.status(200).render("register");
});

app.get("/datos", (req, res) => {
    res.json(req.session);
});

app.get("/info", (req, res) => {
    res.render("info", {
        args: process.argv.slice(2).join(" "),
        os: process.platform,
        nodeVersion: process.version,
        memory: process.memoryUsage().rss,
        path: process.execPath,
        pid: process.pid,
        folder: process.cwd(),
    });
});

app.post(
    "/register",
    passport.authenticate("local-register", {
        successRedirect: "/",
        failureRedirect: "/register",
        passReqToCallback: true,
    }),
    (req, res) => {}
);

app.post(
    "/login",
    passport.authenticate("local-login", {
        successRedirect: "/",
        failureRedirect: "/login",
        passReqToCallback: true,
    }),
    (req, res) => {}
);

app.post("/logout", isLogged, (req, res) => {
    try {
        const email = req.user.email;
        req.session.destroy((err) => {
            res.status(200).render("logout", { nombreUsuario: email });
        });
    } catch (e) {
        res.status(500).send(e);
    }
});

// [ --------- CORRER EL SERVIDOR --------- ] //

const PORT = parseArgs(process.argv.slice(2)).port || 8080;

httpServer.listen(PORT, () => console.log("Lisstooooo ", PORT));

// [ --------- SOCKET --------- ] //

io.on("connection", async (socket) => {
    console.log(`Nuevo cliente conectado: ${socket.id.substring(0, 4)}`);
    socket.on("productoAgregado", async (producto) => {
        // console.log(producto);
        const respuestaApi = await archProductos.save(producto);
        console.log({ respuestaApi });
        // respuestaApi es el ID del producto, si no es un número, es un error (ver API)
        if (!respuestaApi) {
            socket.emit("productoInvalido", { error: "Producto inválido" });
        } else {
            console.log(respuestaApi, "producto valido");
            io.sockets.emit("productosRefresh", await archProductos.getAll());
        }
    });

    socket.on("mensajeEnviado", async (mensaje) => {
        await archMensajes.save(mensaje);
        io.sockets.emit("chatRefresh", mensaje);
    });
});

import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import Usuario from "../models/usuario.model.js";
// Re mala práctica importar esto acá pero no me funciona de otra forma no entiendo por qué
import bcrypt from 'bcrypt';

passport.serializeUser((usuario, done) => {
    done(null, usuario.id);
});

passport.deserializeUser(async (id, done) => {
    const usuario = await Usuario.findById(id);
    done(null, usuario);
});

passport.use(
    "local-register",
    new LocalStrategy(
        {
            usernameField: "email",
            passwordField: "password",
            passReqToCallback: true,
        },
        async (req, email, password, done) => {
            const existe = await Usuario.findOne({ email: email });
            if (existe) {
                return done(
                    null,
                    false,
                    req.flash("registerMessage", "Ese email ya tiene una cuenta asociada")
                );
            } else {
                const nuevoUsuario = new Usuario();
                nuevoUsuario.email = email;
                nuevoUsuario.password = await bcrypt.hash(password, 10);
                await nuevoUsuario.save();
                return done(null, nuevoUsuario);
            }
        }
    )
);

passport.use(
    "local-login",
    new LocalStrategy(
        {
            usernameField: "email",
            passwordField: "password",
            passReqToCallback: true,
        },
        async (req, email, password, done) => {
            const usuario = await Usuario.findOne({ email: email });
            if (!usuario) {
                return done(null, false, req.flash("loginMessage", "Credenciales incorrectas"));
            }
            const passOk = await bcrypt.compare(password, usuario.password);
            if (!passOk) {
                return done(null, false, req.flash("loginMessage", "Credenciales incorrectas"));
            }
            // req.session.email = email;
            // console.log(req.session);
            return done(null, usuario, req.flash('email', email));
        }
    )
);

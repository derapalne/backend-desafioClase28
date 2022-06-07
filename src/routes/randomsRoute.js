import express from "express";
const { Router } = express;
const routerRandom = Router();

import { fork } from "child_process";

const forked = fork("./src/utils/randomNumberGen.js");

routerRandom.get("/", (req, res) => {
    const cant = req.query.cant || 100000000;
    forked.send(cant);
    forked.on("message", (msg) => {
        if (msg == "listo") {
            console.log("Proceso hijo cargado");
        } else {
            res.send(msg);
        }
    });
});

export default routerRandom;

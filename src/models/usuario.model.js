import mongoose from "mongoose";
import bcrypt from "bcrypt";

const usuariosCollection = "usuarios";

const usuariosSchema = new mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
});

usuariosSchema.methods.encryptPass = async (password) => {
    return await bcrypt.hash(password, 10);
};

usuariosSchema.methods.comparePass = async function (password) {
    return await bcrypt.compare(password, this.password);
};

const Usuario = new mongoose.model(usuariosCollection, usuariosSchema);
export default Usuario;

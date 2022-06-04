import mongoose from "mongoose";
// Esto podría ir en un .env pero no llego :p
export const mongoUri =
    "mongodb+srv://dera:coderhaus@cluster0.78ayu.mongodb.net/?retryWrites=true&w=majority";
export const advancedOptions = { useNewUrlParser: true, useUnifiedTopology: true };

mongoose
    .connect(mongoUri, advancedOptions)
    .then((db) => console.log("MongoDB conectada 😎👍"))
    .catch((err) => console.log(err));

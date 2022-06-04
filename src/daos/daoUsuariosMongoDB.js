import mongoose from "mongoose";
import 'dotenv/config';


export const advancedOptions = { useNewUrlParser: true, useUnifiedTopology: true };

mongoose
    .connect(process.env.MONGO_URI, advancedOptions)
    .then((db) => console.log("MongoDB conectada 😎👍"))
    .catch((err) => console.log(err));

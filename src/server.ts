import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import app from "./app";

mongoose.set("strictQuery", false);

mongoose
    .connect(process.env.MONGO_URL as string, {})
    .then(() => {
        console.log("MongoDB connection succeed");
        const PORT = process.env.PORT ?? 3008;
        app.listen(PORT, function () {
            console.info(`The server is running successfully on port: ${PORT}`);
            console.info(`Admin project on http://localhost:${PORT}/admin \n`);
        });
    })
    .catch((err) => {
        console.log("ERROR on connection MongoDB", err);
        process.exit(1); // PM2 qayta ishga tushiradi
    });

import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import routers from "./routes/index.route.js";
import { connectionDB } from "./DB/connection.js";
import dns from "dns"
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
dns.setServers(["8.8.8.8", "8.8.4.4"]);
app.set("trust proxy", 1)
app.use(cookieParser());
app.use(express.json());
app.use("/api", routers);
connectionDB();
app.listen(port, () => {
    console.log(`Server running on port ${port} successfully`);
});
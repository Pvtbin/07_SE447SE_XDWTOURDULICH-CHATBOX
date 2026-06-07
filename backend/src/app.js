import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors());

//giúp express hiểu và đọc được request body dưới dạng Json
app.use(express.json());
app.use(cookieParser());

export default app;
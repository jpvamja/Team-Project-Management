import express from "express";
import loaders from "./loaders/index.js";

const app = express();

await loaders(app);

export default app;

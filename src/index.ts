import express from "express";

import deezerRouter from "./controllers/deezer.controller";

const app = express();
const PORT = process.env.PORT || 3000;

console.log(import.meta.dirname);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(deezerRouter);

app.get("/", (req, res) => {
  res.json({ message: "Musify Server is running" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

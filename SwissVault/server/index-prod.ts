import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Папка со статикой Vite
const staticDir = path.join(__dirname, "client");
app.use(express.static(staticDir));

// Fallback на index.html
app.get("*", (_, res) => {
  res.sendFile(path.join(staticDir, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});

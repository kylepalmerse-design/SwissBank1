import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// если у тебя сборка фронта кладёт клиентские файлы в dist/public
const staticPath = path.join(__dirname, "..", "dist", "public");

app.use(express.static(staticPath));

// — остальные маршруты + API, как у тебя было

// старт сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

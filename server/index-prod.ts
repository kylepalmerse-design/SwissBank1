import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Отдаём собранный Vite-фронтенд
app.use(express.static(path.join(__dirname, '../dist')));

// Все остальные запросы — на index.html (чтобы работали роуты React Router и т.п.)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`SwissVault live on port ${PORT}`);
});

import express from 'express';
import cors from 'cors';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Подключение к Neon (замените на вашу схему)
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

// Пример роута (добавьте ваши)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', db: 'connected' });
});

// Ваши роуты для SwissBank здесь...

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

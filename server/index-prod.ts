import express from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

// Статика для фронтенда
const staticPath = path.resolve('./dist/public');
app.use(express.static(staticPath));

// Любые остальные маршруты направляем на index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(staticPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
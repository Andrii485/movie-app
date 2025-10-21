const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5001;

// Настройка CORS — разрешаем запросы с localhost:3000
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// Логируем все запросы
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use('/api', apiRoutes);

// Обработка 404
app.use('*', (req, res) => {
  console.log(`404: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Not found' });
});

// Глобальный обработчик ошибок
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API: http://localhost:${PORT}/api/movies`);
});
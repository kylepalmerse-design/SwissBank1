import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import cookieParser from 'cookie-parser'; // Добавь это, если нет в deps — npm install cookie-parser
import pgSimple from 'connect-pg-simple'; // Уже в deps
import { Pool } from 'pg'; // Для Postgres (NeonDB)
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Cookie parser — обязательно перед session
app.use(cookieParser());

// Session with PG store for production
const PGStore = pgSimple(session);
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
app.use(cookieParser());
app.use(session({
  store: new PGStore({ pool, tableName: 'sessions' }), // Таблица sessions создастся автоматически
  secret: process.env.SESSION_SECRET || 'swiss-bank-secret-2025', // Из Environment
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production', // Secure в prod
    maxAge: 24 * 60 * 60 * 1000 // 1 день
  }
}));

// Passport setup (локальная стратегия для логина)
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password'
}, async (username, password, done) => {
  // Твоя логика логина (из базы или моков)
  // Пример с базой (Drizzle или pg)
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = rows[0];
    if (!user || user.password !== password) {
      return done(null, false, { message: 'Incorrect username or password' });
    }
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user, done) => done(null, user.username));

passport.deserializeUser(async (username, done) => {
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    done(null, rows[0]);
  } catch (err) {
    done(err);
  }
}));

// Роуты
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist'))); // Фронт

// Логин роут
app.post('/api/auth/login', passport.authenticate('local', { session: true }), (req, res) => {
  res.json({ success: true, user: { username: req.user.username } });
});

// User роут (проверка аутентификации)
app.get('/api/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

// Catch-all для SPA
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../dist/index.html')));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
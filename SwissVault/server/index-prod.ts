import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import cookieParser from 'cookie-parser';
import pgSimple from 'connect-pg-simple';
import { Pool } from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

// Body parser для JSON
app.use(express.json());

// Body parser для form-data
app.use(express.urlencoded({ extended: true }));

// Cookie parser перед session
app.use(cookieParser());

// Pool для Postgres
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Session с PG store
const PGStore = pgSimple(session);
app.use(session({
  store: new PGStore({ pool, tableName: 'sessions' }),
  secret: process.env.SESSION_SECRET || 'swiss-bank-secret-2025',
  resave: false,
  saveUninitialized: false,
  cookie: { path: '/', secure: true, httpOnly: true, sameSite: 'lax', maxAge: 24 * 60 * 60 * 1000 }
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password'
}, async (username, password, done) => {
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
app.use(express.static(path.join(__dirname, '../dist/public'))); // Фронт

app.post('/api/auth/login', passport.authenticate('local', { failureMessage: true }), (req, res) => {
  res.json({ success: true, user: { username: req.user.username } });
});

app.get('/api/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

// Catch-all для SPA
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../dist/public/index.html')));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
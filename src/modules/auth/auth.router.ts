import { Router } from 'express';
import { register, login, refreshToken } from './auth.service';

const r = Router();

r.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const user = await register(email, password, name);
    res.json({ ok: true, user: { id: user.id, email: user.email } });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

r.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const tokens = await login(email, password);
    res.json(tokens);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

r.post('/refresh', async (req, res) => {
  try {
    const { token } = req.body;
    const t = await refreshToken(token);
    res.json(t);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

export default r;

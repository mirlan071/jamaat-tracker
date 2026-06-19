const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'jamaat-tracker-secret-key-2024';

function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Требуется авторизация' });

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Неверный токен' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
    return res.status(403).json({ error: 'Нет доступа' });
  }
  next();
}

function requireSuperAdmin(req, res, next) {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ error: 'Требуется главный админ' });
  }
  next();
}

module.exports = { authenticate, requireAdmin, requireSuperAdmin, SECRET };

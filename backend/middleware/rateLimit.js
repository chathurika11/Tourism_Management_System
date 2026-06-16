const loginAttempts = new Map();

const loginRateLimiter = (req, res, next) => {
  const key = `${req.ip}:${req.body?.username || ''}`;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const maxAttempts = 8;
  const attempts = (loginAttempts.get(key) || []).filter((time) => now - time < windowMs);

  if (attempts.length >= maxAttempts) {
    return res.status(429).json({ error: 'Too many login attempts. Please try again later.' });
  }

  attempts.push(now);
  loginAttempts.set(key, attempts);
  next();
};

module.exports = { loginRateLimiter };

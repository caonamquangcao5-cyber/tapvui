import jwt from 'jsonwebtoken'

export function generateToken(user) {
  return jwt.sign(
    { id: user.id, phone: user.phone, role: user.role, name: user.name },
    process.env.JWT_SECRET || 'tapvui_secret_key_2024',
    { expiresIn: '7d' }
  )
}

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Chưa đăng nhập' })
  }
  const token = header.split(' ')[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tapvui_secret_key_2024')
    req.user = decoded
    next()
  } catch {
    return res.status(401).json({ error: 'Phiên đăng nhập hết hạn' })
  }
}

export function requirePT(req, res, next) {
  if (req.user.role !== 'pt') {
    return res.status(403).json({ error: 'Chỉ PT mới được phép' })
  }
  next()
}

export function requireOwner(req, res, next) {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ error: 'Không có quyền truy cập' })
  }
  next()
}

import { Router } from 'express'
import { register, login, getMe, changePassword, updateProfile } from '../controllers/authController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.get('/me', authMiddleware, getMe)
router.put('/password', authMiddleware, changePassword)
router.put('/profile', authMiddleware, updateProfile)

export default router

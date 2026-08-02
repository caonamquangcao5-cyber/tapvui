import { Router } from 'express'
import { listUsers, deleteUser, resetPassword, exportData, importData } from '../controllers/adminController.js'
import { authMiddleware, requireOwner } from '../middleware/auth.js'

const router = Router()

router.use(authMiddleware, requireOwner)
router.get('/users', listUsers)
router.delete('/users/:id', deleteUser)
router.put('/users/:id/password', resetPassword)
router.get('/export', exportData)
router.post('/import', importData)

export default router

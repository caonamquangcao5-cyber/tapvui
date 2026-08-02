import { Router } from 'express'
import { checkin, getCheckins, ptReaction } from '../controllers/checkinController.js'
import { authMiddleware, requirePT } from '../middleware/auth.js'

const router = Router()

router.post('/', authMiddleware, checkin)
router.get('/:studentId', authMiddleware, getCheckins)
router.post('/reaction', authMiddleware, requirePT, ptReaction)

export default router

import { Router } from 'express'
import { createWorkout, getWorkouts, getTodayWorkout } from '../controllers/workoutController.js'
import { authMiddleware, requirePT } from '../middleware/auth.js'

const router = Router()

router.post('/', authMiddleware, requirePT, createWorkout)
router.get('/:studentId', authMiddleware, getWorkouts)
router.get('/:studentId/today', authMiddleware, getTodayWorkout)

export default router

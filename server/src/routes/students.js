import { Router } from 'express'
import { listStudents, addStudent, getStudentDetail, getMyProfile, updateStudent, removeStudent } from '../controllers/studentController.js'
import { authMiddleware, requirePT } from '../middleware/auth.js'

const router = Router()

router.get('/', authMiddleware, requirePT, listStudents)
router.post('/', authMiddleware, requirePT, addStudent)
router.get('/me', authMiddleware, getMyProfile)
router.get('/:id', authMiddleware, requirePT, getStudentDetail)
router.put('/:id', authMiddleware, requirePT, updateStudent)
router.delete('/:id', authMiddleware, requirePT, removeStudent)

export default router

import express from 'express'
import protect from '../middleware/authMiddleware.js'
import { askQuestion, getChatHistory } from '../controllers/chatController.js'

const router = express.Router()

router.use(protect)

router.post('/:id/chat', askQuestion)
router.get('/:id/chat', getChatHistory)

export default router
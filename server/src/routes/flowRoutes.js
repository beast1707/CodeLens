import express from 'express'
import protect from '../middleware/authMiddleware.js'
import { getFlow } from '../controllers/flowController.js'

const router = express.Router()

router.use(protect)
router.post('/:id/flow', getFlow)

export default router
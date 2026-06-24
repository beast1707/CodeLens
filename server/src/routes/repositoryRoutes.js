import express from 'express'
import protect from '../middleware/authMiddleware.js'
import {
  importRepository,
  getMyRepositories,
  getRepositoryById,
  getRepositoryFiles,
  getFileContent,
  deleteRepository
} from '../controllers/repositoryController.js'

const router = express.Router()

router.use(protect) 

router.post('/import', importRepository)
router.get('/', getMyRepositories)
router.get('/:id', getRepositoryById)
router.get('/:id/files', getRepositoryFiles)
router.get('/:id/files/:fileId', getFileContent)
router.delete('/:id', deleteRepository)

export default router
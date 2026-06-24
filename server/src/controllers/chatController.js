import ChatHistory from '../models/ChatHistory.js'
import Repository from '../models/Repository.js'
import { generateAnswer } from '../services/groqService.js'


export const askQuestion = async (req, res) => {
  try {
    const { question } = req.body
    const { id: repositoryId } = req.params
    const userId = req.user.id

    if (!question)
      return res.status(400).json({ message: 'Question is required' })

    const repository = await Repository.findOne({ _id: repositoryId, owner: userId })

    if (!repository)
      return res.status(404).json({ message: 'Repository not found' })

    if (repository.status !== 'ready')
      return res.status(400).json({ message: `Repository is not ready yet (status: ${repository.status})` })

    const { answer, sources } = await generateAnswer(question, repository.pineconeNamespace, repositoryId)

    const chat = await ChatHistory.create({
      repositoryId,
      userId,
      question,
      answer,
      sourcesUsed: sources
    })

    res.json(chat)

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}


export const getChatHistory = async (req, res) => {
  try {
    const { id: repositoryId } = req.params

    const chats = await ChatHistory.find({
      repositoryId,
      userId: req.user.id
    }).sort({ createdAt: 1 })

    res.json(chats)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}
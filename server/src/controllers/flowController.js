import ChatHistory from '../models/ChatHistory.js'
import Repository from '../models/Repository.js'
import { generateFlow } from '../services/groqService.js'

export const getFlow = async (req, res) => {
  try {
    const { query } = req.body
    const { id: repositoryId } = req.params
    const userId = req.user.id

    if (!query)
      return res.status(400).json({ message: 'Query is required' })

    const repository = await Repository.findOne({ _id: repositoryId, owner: userId })

    if (!repository)
      return res.status(404).json({ message: 'Repository not found' })

    if (repository.status !== 'ready')
      return res.status(400).json({ message: `Repository is not ready yet (status: ${repository.status})` })

    const flow = await generateFlow(query, repository.pineconeNamespace, repositoryId)

    const saved = await ChatHistory.create({
      repositoryId,
      userId,
      question: query,
      answer: `Generated flow: ${flow.title}`,
      type: 'flow',
      flowData: flow
    })

    res.json(saved)

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}
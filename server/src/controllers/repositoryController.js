import Repository from '../models/Repository.js'
import FileMetadata from '../models/FileMetadata.js'
import { fetchAndAnalyzeRepo, parseGithubUrl } from '../services/githubService.js'
import { storeRepoEmbeddings, deleteRepoEmbeddings } from '../services/pineconeService.js'


export const importRepository = async (req, res) => {
  try {
    const { githubUrl } = req.body
    const userId = req.user.id

    if (!githubUrl)
      return res.status(400).json({ message: 'GitHub URL required' })

   
    const { repoOwner, repoName } = parseGithubUrl(githubUrl)

  
    const existing = await Repository.findOne({ repoOwner, repoName, owner: userId })
    if (existing)
      return res.status(409).json({ message: 'Repository already imported', repository: existing })

   
    const repository = await Repository.create({
      name: repoName,
      githubUrl,
      owner: userId,
      repoOwner,
      repoName,
      status: 'pending'
    })

  
    res.status(202).json({
      message: 'Import started',
      repository
    })

  
    processRepository(repository._id, repoOwner, repoName)

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}


const processRepository = async (repositoryId, repoOwner, repoName) => {
  try {
    await Repository.findByIdAndUpdate(repositoryId, { status: 'processing' })

    
    const { repoMetadata, files } = await fetchAndAnalyzeRepo(repoOwner, repoName)

    if (files.length === 0) {
      await Repository.findByIdAndUpdate(repositoryId, { status: 'failed' })
      return
    }

   
    const fileDocuments = files.map(file => ({
      repositoryId,
      ...file
    }))
    await FileMetadata.insertMany(fileDocuments)

  
    const namespace = repositoryId.toString()
    await storeRepoEmbeddings(files, namespace)


    await Repository.findByIdAndUpdate(repositoryId, {
      status: 'ready',
      totalFiles: files.length,
      description: repoMetadata.description,
      language: repoMetadata.language,
      stars: repoMetadata.stars,
      pineconeNamespace: namespace
    })

    console.log(`Repository ${repositoryId} ready with ${files.length} files`)

  } catch (err) {
    console.error('Processing failed:', err.message)
    await Repository.findByIdAndUpdate(repositoryId, { status: 'failed' })
  }
}


export const getMyRepositories = async (req, res) => {
  try {
    const repositories = await Repository.find({ owner: req.user.id })
      .sort({ createdAt: -1 })
    res.json(repositories)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}


export const getRepositoryById = async (req, res) => {
  try {
    const repository = await Repository.findOne({
      _id: req.params.id,
      owner: req.user.id
    })

    if (!repository)
      return res.status(404).json({ message: 'Repository not found' })

    res.json(repository)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}


export const getRepositoryFiles = async (req, res) => {
  try {
    const repository = await Repository.findOne({
      _id: req.params.id,
      owner: req.user.id
    })

    if (!repository)
      return res.status(404).json({ message: 'Repository not found' })

    const files = await FileMetadata.find({ repositoryId: req.params.id })
      .select('-content') 

    res.json(files)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}


export const getFileContent = async (req, res) => {
  try {
    const file = await FileMetadata.findOne({
      _id: req.params.fileId,
      repositoryId: req.params.id
    })

    if (!file)
      return res.status(404).json({ message: 'File not found' })

    res.json(file)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}


export const deleteRepository = async (req, res) => {
  try {
    const repository = await Repository.findOne({
      _id: req.params.id,
      owner: req.user.id
    })

    if (!repository)
      return res.status(404).json({ message: 'Repository not found' })

    await FileMetadata.deleteMany({ repositoryId: req.params.id })

    if (repository.pineconeNamespace) {
      await deleteRepoEmbeddings(repository.pineconeNamespace)
    }

    await Repository.findByIdAndDelete(req.params.id)

    res.json({ message: 'Repository deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}
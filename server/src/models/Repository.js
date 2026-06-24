import mongoose from 'mongoose'

const repositorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  githubUrl: {
    type: String,
    required: true,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  repoOwner: {
    type: String,
    required: true
  },
  repoName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  language: {
    type: String,
    default: ''
  },
  stars: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'ready', 'failed'],
    default: 'pending'
  },
  totalFiles: {
    type: Number,
    default: 0
  },
  pineconeNamespace: {
    type: String,
    default: ''
  }
}, { timestamps: true })

export default mongoose.model('Repository', repositorySchema)
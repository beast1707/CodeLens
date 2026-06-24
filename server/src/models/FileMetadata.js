import mongoose from 'mongoose'

const fileMetadataSchema = new mongoose.Schema({
  repositoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Repository',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  language: {
    type: String,
    default: ''
  },
  size: {
    type: Number,
    default: 0
  },
  functions: {
    type: [String],
    default: []
  },
  classes: {
    type: [String],
    default: []
  },
  imports: {
    type: [String],
    default: []
  },
  content: {
    type: String,
    default: ''
  }
}, { timestamps: true })

export default mongoose.model('FileMetadata', fileMetadataSchema)
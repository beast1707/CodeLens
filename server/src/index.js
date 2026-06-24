import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import authRoutes from './routes/authRoutes.js'
import repositoryRoutes from './routes/repositoryRoutes.js'
import chatRoutes from './routes/chatRoutes.js'
import flowRoutes from './routes/flowRoutes.js'

dotenv.config()

const app = express()

app.use(helmet())
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true 
}))
app.use(express.json())
app.use(cookieParser())

app.use('/api/auth', authRoutes)
app.use('/api/repositories', repositoryRoutes)
app.use('/api/repositories', chatRoutes)
app.use('/api/repositories', flowRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'CodeLens AI running' })
})

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected')
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`)
    })
  })
  .catch(err => console.error(err))
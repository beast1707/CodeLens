import dotenv from 'dotenv';

dotenv.config();

import { Pinecone } from '@pinecone-database/pinecone'

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY })
const index = pc.index({ name: process.env.PINECONE_INDEX })



const generateEmbeddings = async (textChunks) => {
  const response = await pc.inference.embed({
    model: 'llama-text-embed-v2',
    inputs: textChunks,
    parameters: { inputType: 'passage', truncate: 'END' }
  })

  return response.data.map(item => item.values)
}


import { generateFileSummary } from './groqService.js'


export const storeRepoEmbeddings = async (files, namespace) => {
  console.log('Generating summaries for', files.length, 'files...')

  const summaries = []

  for (const file of files) {
    const summary = await generateFileSummary(
      file.filePath,
      file.content,
      file.functions,
      file.classes
    )
    summaries.push({
      fileName: file.filePath,
      summary
    })
    console.log(`Summarized: ${file.filePath}`)
  }

  console.log('Generating embeddings for summaries...')

  const BATCH_SIZE = 90
  const vectors = []

  for (let i = 0; i < summaries.length; i += BATCH_SIZE) {
    const batch = summaries.slice(i, i + BATCH_SIZE)
    const texts = batch.map(s => `File: ${s.fileName}\n\n${s.summary}`)

    const embeddings = await generateEmbeddings(texts)

    batch.forEach((item, idx) => {
      vectors.push({
        id: `${item.fileName}-summary`,
        values: embeddings[idx],
        metadata: {
          fileName: item.fileName,
          summary: item.summary
        }
      })
    })

    console.log(`Embedded batch ${i / BATCH_SIZE + 1}`)
  }

  const UPSERT_BATCH = 100
  for (let i = 0; i < vectors.length; i += UPSERT_BATCH) {
    const batch = vectors.slice(i, i + UPSERT_BATCH)
    await index.namespace(namespace).upsert({ records: batch })
    console.log(`Uploaded ${i + batch.length}/${vectors.length} vectors`)
  }

  return { totalChunks: vectors.length }
}


export const searchRepoEmbeddings = async (question, namespace, topK = 6) => {
  const [queryEmbedding] = await generateEmbeddings([question])

  const results = await index.namespace(namespace).query({
    vector: queryEmbedding,
    topK,
    includeMetadata: true
  })

  return results.matches.map(match => ({
    fileName: match.metadata.fileName,
    summary: match.metadata.summary,
    score: match.score
  }))
}


export const deleteRepoEmbeddings = async (namespace) => {
  await index.namespace(namespace).deleteAll()
}
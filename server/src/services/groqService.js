import dotenv from 'dotenv';

dotenv.config();

import Groq from 'groq-sdk'
import { searchRepoEmbeddings } from './pineconeService.js'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })



export const generateFileSummary = async (fileName, content, functions, classes) => {
  try {
    const truncatedContent = content.slice(0, 3000) 

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You summarize code files in 2-3 plain English sentences.
Mention what the file does, its main responsibilities, and key technologies/patterns used (e.g. authentication, database queries, API routes, UI rendering).
Be specific and use natural language a developer would search with. Do not use code syntax in the summary.`
        },
        {
          role: 'user',
          content: `File: ${fileName}
Functions: ${functions.join(', ') || 'none detected'}
Classes: ${classes.join(', ') || 'none detected'}

Code:
${truncatedContent}

Summarize this file in 2-3 sentences.`
        }
      ],
      temperature: 0.2,
      max_tokens: 150
    })

    return completion.choices[0].message.content.trim()
  } catch (err) {
    console.error(`Summary generation failed for ${fileName}:`, err.message)
    
    return `File ${fileName} containing functions: ${functions.join(', ') || 'none'}`
  }
}


export const generateFlow = async (query, namespace, repositoryId) => {
  const relevantFiles = await searchRepoEmbeddings(query, namespace, 8)

  if (relevantFiles.length === 0) {
    return { title: query, steps: [] }
  }

  const fileNames = relevantFiles.map(f => f.fileName)
  const fullFiles = await FileMetadata.find({
    repositoryId,
    filePath: { $in: fileNames }
  })

  const context = fullFiles.map(file => {
    return `[File: ${file.filePath}]\n${file.content.slice(0, 2000)}`
  }).join('\n\n---\n\n')

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `You analyze code and output a step-by-step flow as STRICT JSON only.

RULES:
- Output ONLY valid JSON. No markdown, no explanation, no code fences, no extra text before or after.
- Use ONLY information from the provided code context. Never invent files or steps that aren't shown.
- Each step must reference a real file from the context.
- Keep descriptions to one short sentence.

Required JSON shape:
{
  "title": "string describing the flow",
  "steps": [
    { "step": 1, "label": "short name e.g. function or component name", "description": "one sentence", "file": "exact file path from context" }
  ]
}`
      },
      {
        role: 'user',
        content: `Code Context:\n\n${context}\n\nGenerate the step-by-step flow for: ${query}`
      }
    ],
    temperature: 0.2,
    max_tokens: 800,
    response_format: { type: 'json_object' }
  })

  const raw = completion.choices[0].message.content

  try {
    return JSON.parse(raw)
  } catch (err) {
    console.error('Flow JSON parse failed:', err.message)
    return { title: query, steps: [] }
  }
}


import FileMetadata from '../models/FileMetadata.js'

export const generateAnswer = async (question, namespace, repositoryId) => {
 
  const relevantFiles = await searchRepoEmbeddings(question, namespace, 6)

  if (relevantFiles.length === 0) {
    return {
      answer: "I couldn't find relevant files in this repository to answer that question.",
      sources: []
    }
  }

  
  const fileNames = relevantFiles.map(f => f.fileName)
  const fullFiles = await FileMetadata.find({
    repositoryId,
    filePath: { $in: fileNames }
  })


  const context = fullFiles.map(file => {
    return `[File: ${file.filePath}]\n${file.content.slice(0, 2500)}`
  }).join('\n\n---\n\n')


  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `You are a helpful AI assistant that explains codebases to developers.
You will be given real code from relevant files and a question.

STRICT RULES:
- Answer using ONLY the code shown in the provided context. Never invent or guess code that isn't shown to you.
- If the provided files don't fully answer the question, say what's missing.
- NEVER write hypothetical/example code blocks. Only show code directly from the provided context.
- Reference specific file names when relevant.
- Keep answers clear and well-structured.`
      },
      {
        role: 'user',
        content: `Code Context:\n\n${context}\n\nQuestion: ${question}`
      }
    ],
    temperature: 0.3,
    max_tokens: 1024
  })

  const answer = completion.choices[0].message.content
  const sources = fullFiles.map(f => f.filePath)

  return { answer, sources }
}
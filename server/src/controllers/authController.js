import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'


const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' })
}


const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' })
}


const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict'
}

const sendTokens = (res, user) => {
  const accessToken = generateAccessToken(user._id)
  const refreshToken = generateRefreshToken(user._id)

  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000 
  })

  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000 
  })

  return refreshToken
}


export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields required' })

    const existingUser = await User.findOne({ email })
    if (existingUser)
      return res.status(409).json({ message: 'Email already registered' })

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    })

    const refreshToken = sendTokens(res, user)
    user.refreshToken = refreshToken
    await user.save()

    res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email }
    })

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}


export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password)
      return res.status(400).json({ message: 'All fields required' })

    const user = await User.findOne({ email })
    if (!user)
      return res.status(401).json({ message: 'Invalid credentials' })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid credentials' })

    const refreshToken = sendTokens(res, user)
    user.refreshToken = refreshToken
    await user.save()

    res.json({
      user: { id: user._id, name: user.name, email: user.email }
    })

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}


export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.cookies

    if (!refreshToken)
      return res.status(401).json({ message: 'No refresh token provided' })

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)

    const user = await User.findById(decoded.id)
    if (!user || user.refreshToken !== refreshToken)
      return res.status(403).json({ message: 'Invalid refresh token' })

    const newAccessToken = generateAccessToken(user._id)

    res.cookie('accessToken', newAccessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000
    })

    res.json({ message: 'Access token refreshed' })

  } catch (err) {
    res.status(403).json({ message: 'Invalid or expired refresh token' })
  }
}


export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.cookies

    if (refreshToken) {
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
      await User.findByIdAndUpdate(decoded.id, { refreshToken: null })
    }

    res.clearCookie('accessToken', cookieOptions)
    res.clearCookie('refreshToken', cookieOptions)

    res.json({ message: 'Logged out successfully' })

  } catch (err) {
    
    res.clearCookie('accessToken', cookieOptions)
    res.clearCookie('refreshToken', cookieOptions)
    res.json({ message: 'Logged out successfully' })
  }
}


export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -refreshToken')
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}
import jwt from 'jsonwebtoken'

const protect = (req, res, next) => {
  try {
    const { accessToken } = req.cookies

    if (!accessToken)
      return res.status(401).json({ message: 'No access token provided' })

    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
    req.user = decoded
    next()

  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired access token' })
  }
}

export default protect
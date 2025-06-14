import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET as string

export function signJwt(payload: JwtPayload, options: SignOptions = { expiresIn: '7d' }) {
  return jwt.sign(payload, SECRET, options)
}

export function verifyJwt(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, SECRET) as JwtPayload
  } catch (error) {
    console.error("JWT verification failed:", error)
    return null
  }
}

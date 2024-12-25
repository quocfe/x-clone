import { config } from 'dotenv'
import jwt from 'jsonwebtoken'

config()

export function signToken({
  payload,
  privateKey,
  options = {
    algorithm: 'HS256'
  }
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any
  privateKey: string
  options?: jwt.SignOptions
}) {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, privateKey, options, (error, token) => {
      if (error) {
        throw reject(error)
      }
      resolve(token as string)
    })
  })
}

export function verifyToken({ token, secretOrPublicKey }: { token: string; secretOrPublicKey: string }) {
  return new Promise<jwt.JwtPayload>((resolve, reject) => {
    jwt.verify(token, secretOrPublicKey, (error, decoded) => {
      if (error) {
        throw reject(error)
      }
      resolve(decoded as jwt.JwtPayload)
    })
  })
}

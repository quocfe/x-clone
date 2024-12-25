import { createHash } from 'crypto'
import { envConfig } from '~/constants/config'

function sha256(content: string) {
  return createHash('sha256').update(content).digest('hex')
}

export function hashPassword(password: string) {
  return sha256(password + envConfig.PASSWORD_SALT)
}

export function comparePassword(password: string, hash: string) {
  return hashPassword(password) === hash
}

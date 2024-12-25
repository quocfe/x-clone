import { JwtPayload } from 'jsonwebtoken'
import { UserVerifyStatus } from '~/constants/enum'

export interface RegisterResBody {
  name: string
  email: string
  password: string
  confirnm_password: string
  date_of_birth: Date
}

export interface LoginResBody {
  email: string
  password: string
}

export interface UpdateMeResBody {
  name?: string
  date_of_birth?: string
  bio?: string
  location?: string
  website?: string
  username?: string
  avatar?: string
  cover_photo?: string
}

export interface FollowResBody {
  followed_user_id: string
}

export interface UnFollowResParams {
  user_id: string
}

export interface LogoutResBody {
  refresh_token: string
}

export interface TokenPayload extends JwtPayload {
  user_id: string
  token_type: string
  verify: UserVerifyStatus
  exp: number
  iat: number
}

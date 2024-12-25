import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enum'

interface UserType {
  _id?: ObjectId
  name?: string
  email: string
  date_of_birth?: Date
  password: string
  created_at?: Date
  updated_at?: Date
  email_verify_token?: string // jwt hoặc '' nếu đã xác thực email
  forgot_password_token?: string // jwt hoặc '' nếu đã xác thực email
  verify?: UserVerifyStatus
  twitter_circle?: ObjectId[]
  bio?: string // optional
  location?: string // optional
  website?: string // optional
  username?: string // optional
  avatar?: string // optional
  cover_photo?: string // optional
}

export default class User {
  _id?: ObjectId
  name: string
  email: string
  date_of_birth: Date
  password: string
  created_at: Date
  updated_at: Date
  email_verify_token: string
  forgot_password_token: string
  verify: UserVerifyStatus
  twitter_circle?: ObjectId[]
  bio: string
  location: string
  website: string
  username: string
  avatar: string
  cover_photo: string

  constructor(userData: UserType) {
    const date = new Date()
    this._id = userData._id
    this.name = userData.name || ''
    this.email = userData.email || ''
    this.date_of_birth = userData.date_of_birth || new Date()
    this.password = userData.password || ''
    this.created_at = userData.created_at || date
    this.updated_at = userData.updated_at || date
    this.email_verify_token = userData.email_verify_token || ''
    this.forgot_password_token = userData.forgot_password_token || ''
    this.verify = userData.verify || UserVerifyStatus.Unverified
    this.twitter_circle = userData.twitter_circle || []
    this.bio = userData.bio || ''
    this.location = userData.location || ''
    this.website = userData.website || ''
    this.username = userData.username || ''
    this.avatar = userData.avatar || ''
    this.cover_photo = userData.cover_photo || ''
  }
}

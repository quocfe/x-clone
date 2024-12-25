/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request } from 'express'
import { TokenPayload } from '~/models/requests/User.requests'
import Tweet from '~/models/schema/Tweet.schema'
import User from '~/models/schema/User.schema'

declare module 'express' {
  interface Request {
    user?: User
    decoded_authorization?: TokenPayload
    decoded_refresh_token?: TokenPayload
    decoded_email_verify_token?: TokenPayload
    decoded_forgot_password_verify_token?: TokenPayload
    tweet?: Tweet
  }
}

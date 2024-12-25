import { ObjectId } from 'mongodb'
import { envConfig } from '~/constants/config'
import { TokenType, UserVerifyStatus } from '~/constants/enum'
import { ErrorWithStatus } from '~/models/Errors'
import { RegisterResBody, UpdateMeResBody } from '~/models/requests/User.requests'
import Follow from '~/models/schema/Follow.schema'
import RefreshToken from '~/models/schema/RefreshToken.schema'
import User from '~/models/schema/User.schema'
import dataBaseService from '~/services/database.service'
import { hashPassword } from '~/utils/crypto'
import { signToken, verifyToken } from '~/utils/jwt'

class UsersService {
  private signAccessToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: { user_id, token_type: TokenType.AsscessToken, verify },
      privateKey: envConfig.JWT_SECRET_ACCESS_TOKEN as string,
      options: {
        expiresIn: '1d'
      }
    })
  }

  private signRefeshToken({ user_id, verify, exp }: { user_id: string; verify: UserVerifyStatus; exp?: number }) {
    if (exp) {
      return signToken({
        payload: { user_id, token_type: TokenType.RefreshToken, verify, exp },
        privateKey: envConfig.JWT_SECRET_REFRESH_TOKEN as string
      })
    }
    return signToken({
      payload: { user_id, token_type: TokenType.RefreshToken, verify },
      privateKey: envConfig.JWT_SECRET_REFRESH_TOKEN as string,
      options: {
        expiresIn: '10d'
      }
    })
  }

  private signEmailVerifyToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: { user_id, token_type: TokenType.EmailVerifyToken, verify },
      privateKey: envConfig.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
      options: {
        expiresIn: '1d'
      }
    })
  }

  private decodeRefreshToken(refresh_token: string) {
    return verifyToken({ token: refresh_token, secretOrPublicKey: envConfig.JWT_SECRET_REFRESH_TOKEN as string })
  }

  private signForgotPasswordToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: { user_id, token_type: TokenType.ForgotPasswordToken, verify },
      privateKey: envConfig.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
      options: {
        expiresIn: '5m'
      }
    })
  }

  async signTokens({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return await Promise.all([this.signAccessToken({ user_id, verify }), this.signRefeshToken({ user_id, verify })])
  }

  async register(payload: RegisterResBody) {
    const user_id = new ObjectId()
    const verify_email_token = await this.signEmailVerifyToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })
    await dataBaseService.users.insertOne(
      new User({
        ...payload,
        _id: user_id,
        username: `user${user_id.toString()}`,
        password: hashPassword(payload.password),
        email_verify_token: verify_email_token
      })
    )
    // const user_id = result.insertedId.toString()
    const [asscessToken, refreshToken] = await this.signTokens({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })

    const { exp, iat } = await this.decodeRefreshToken(refreshToken)

    await dataBaseService.refeshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refreshToken, exp: exp as number, iat: iat as number })
    )
    console.log('verify_email_token', verify_email_token)
    return {
      asscessToken,
      refreshToken
    }
  }

  async refreshToken(user_id: string, refresh_token: string, verify: UserVerifyStatus, exp: number) {
    const [new_access_token, new_refresh_token] = await Promise.all([
      this.signAccessToken({ user_id, verify }),
      this.signRefeshToken({ user_id, verify, exp }),
      dataBaseService.refeshTokens.deleteOne({ token: refresh_token })
    ])

    const { iat } = await this.decodeRefreshToken(new_refresh_token)
    await dataBaseService.refeshTokens.insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id),
        token: new_refresh_token,
        exp: exp as number,
        iat: iat as number
      })
    )
    return { access_token: new_access_token, refresh_token: new_refresh_token }
  }

  async checkEmailExists(email: string) {
    const result = await dataBaseService.users.findOne({ email: email })
    return Boolean(result)
  }

  async login({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const [asscessToken, refreshToken] = await this.signTokens({ user_id, verify })
    const { exp, iat } = await this.decodeRefreshToken(refreshToken)
    await dataBaseService.refeshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refreshToken, exp: exp as number, iat: iat as number })
    )
    return { asscessToken, refreshToken }
  }

  async logout(refresh_token: string) {
    const result = await dataBaseService.refeshTokens.deleteOne({ token: refresh_token })
    return result
  }

  async verifyEmail(user_id: string) {
    await dataBaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      { $set: { email_verify_token: '', verify: UserVerifyStatus.Verified, updated_at: new Date() } }
    )

    const [asscessToken, refreshToken] = await this.signTokens({ user_id, verify: UserVerifyStatus.Verified })

    return {
      asscessToken,
      refreshToken
    }
  }

  async resendVerifyEmail(user_id: string) {
    const verify_email_token = await this.signEmailVerifyToken({ user_id, verify: UserVerifyStatus.Unverified })
    console.log('send mail verify token', verify_email_token)
    await dataBaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      { $set: { email_verify_token: verify_email_token, updated_at: new Date() } }
    )
    return verify_email_token
  }

  async forgotPassword({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const forgot_password_token = await this.signForgotPasswordToken({ user_id, verify })

    console.log('send mail forgot password token', forgot_password_token)

    const result = await dataBaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      { $set: { forgot_password_token } }
    )

    return result
  }

  async resetPassword(user_id: string, password: string) {
    const result = await dataBaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      { $set: { password: hashPassword(password), forgot_password_token: '', updated_at: new Date() } }
    )
    return result
  }

  async getMe(user_id: string) {
    const result = await dataBaseService.users.findOne(
      { _id: new ObjectId(user_id) },
      {
        projection: { password: 0, email_verify_token: 0, forgot_password_token: 0 }
      }
    )
    return result
  }

  async updateMe(user_id: string, body: UpdateMeResBody) {
    const _payload = body.date_of_birth ? { ...body, date_of_birth: new Date(body.date_of_birth) } : body
    const result = await dataBaseService.users.findOneAndUpdate(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: { ...(_payload as UpdateMeResBody & { date_of_birth?: Date }) },
        $currentDate: { updated_at: true }
      },
      {
        returnDocument: 'after',
        projection: { password: 0, email_verify_token: 0, forgot_password_token: 0 }
      }
    )

    return result
  }

  async getProfile(username: string) {
    const result = await dataBaseService.users.findOne(
      { username: username },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
          verify: 0,
          created_at: 0,
          updated_at: 0
        }
      }
    )
    if (result === null) {
      throw new ErrorWithStatus({ message: 'User not found', status: 404 })
    }
    return result
  }

  async followUser(user_id: string, followed_user_id: string) {
    await dataBaseService.follows.insertOne(
      new Follow({ user_id: new ObjectId(user_id), followed_user_id: new ObjectId(followed_user_id) })
    )
  }

  async unFollowUser(_id: string) {
    await dataBaseService.follows.deleteOne({
      _id: new ObjectId(_id)
    })
    return true
  }

  async changePassword(user_id: string, password: string) {
    const result = await dataBaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      { $set: { password: hashPassword(password), updated_at: new Date() } }
    )
    return result
  }
}

const usersService = new UsersService()

export default usersService

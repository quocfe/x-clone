import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { JwtPayload } from 'jsonwebtoken'
import { pick } from 'lodash'
import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enum'
import { ErrorWithStatus } from '~/models/Errors'
import {
  FollowResBody,
  LogoutResBody,
  RegisterResBody,
  TokenPayload,
  UpdateMeResBody
} from '~/models/requests/User.requests'
import User from '~/models/schema/User.schema'
import dataBaseService from '~/services/database.service'
import usersService from '~/services/users.service'
import { comparePassword } from '~/utils/crypto'

export const loginController = async (req: Request, res: Response) => {
  const user = req.user as User
  const user_id = user._id as ObjectId
  const verify = user.verify

  const result = await usersService.login({ user_id: user_id.toString(), verify })
  return res.status(200).json({
    message: 'Login success',
    result
  })
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const registerController = async (req: Request<ParamsDictionary, any, RegisterResBody>, res: Response) => {
  const result = await usersService.register(req.body)
  return res.status(200).json({
    message: result
  })
}

export const refreshTokenController = async (req: Request, res: Response) => {
  const { refresh_token } = req.body
  const decoded_refresh_token = req.decoded_refresh_token as TokenPayload
  const { user_id, verify, exp } = decoded_refresh_token
  const result = await usersService.refreshToken(user_id, refresh_token, verify, exp as number)
  return res.status(200).json({
    message: 'Refresh token success',
    result
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const logoutController = async (req: Request<ParamsDictionary, any, LogoutResBody>, res: Response) => {
  const { refresh_token } = req.body
  await usersService.logout(refresh_token)
  return res.status(200).json({
    message: 'Logout success'
  })
}

export const verifyEmailController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_email_verify_token as TokenPayload

  const user = await dataBaseService.users.findOne({ _id: new ObjectId(user_id) })

  if (!user) {
    throw new ErrorWithStatus({
      message: 'User not found',
      status: 404
    })
  }

  if (user.email_verify_token === '') {
    throw new ErrorWithStatus({
      message: 'Email already verified',
      status: 200
    })
  }

  const result = await usersService.verifyEmail(user_id)

  return res.status(200).json({
    message: 'Email verified',
    result
  })
}

export const resendVerifyEmailController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload

  const user = await dataBaseService.users.findOne({ _id: new ObjectId(user_id) })

  if (!user) {
    throw new ErrorWithStatus({
      message: 'User not found',
      status: 404
    })
  }

  if (user.verify === UserVerifyStatus.Verified) {
    throw new ErrorWithStatus({
      message: 'Email already verified',
      status: 200
    })
  }

  await usersService.resendVerifyEmail(user_id)

  res.status(200).json({
    message: 'Resend verify email success'
  })
}

export const forgotPasswordController = async (req: Request, res: Response) => {
  const user = req.user as User
  const user_id = user._id as ObjectId
  const verify = user.verify
  await usersService.forgotPassword({ user_id: user_id.toString(), verify })

  return res.status(200).json({
    message: 'Forgot password success'
  })
}

export const verifyForgotPasswordController = async (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Verify forgot password success'
  })
}

export const resetPasswordController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_forgot_password_verify_token as JwtPayload
  const { password } = req.body

  await usersService.resetPassword(user_id, password)

  return res.status(200).json({
    message: 'Reset password success'
  })
}

export const meController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload

  const result = await usersService.getMe(user_id)

  return res.status(200).json({
    message: 'Get me success',
    result
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const updateMeController = async (req: Request<ParamsDictionary, any, UpdateMeResBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const body = pick(req.body, [
    'name',
    'date_of_birth',
    'bio',
    'location',
    'website',
    'username',
    'avatar',
    'cover_photo'
  ])
  const result = await usersService.updateMe(user_id, body)
  return res.status(200).json({ message: 'Update me success', result })
}

export const getProfileController = async (req: Request, res: Response) => {
  const { username } = req.params
  const result = await usersService.getProfile(username)
  return res.status(200).json({ message: 'Get profile success', result })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const followUserController = async (req: Request<ParamsDictionary, any, FollowResBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const body = pick(req.body, ['followed_user_id'])
  await usersService.followUser(user_id, body.followed_user_id)
  return res.status(200).json({ message: 'Follow user success' })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const unFollowUserController = async (req: Request, res: Response) => {
  const { _id } = req.body
  await usersService.unFollowUser(_id.toString())
  return res.status(200).json({ message: 'unfollow user success' })
}

export const changePasswordController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { password, new_password } = req.body
  const user = await dataBaseService.users.findOne({ _id: new ObjectId(user_id) })
  const checkPass = comparePassword(password, user?.password as string)

  if (!checkPass) {
    throw new ErrorWithStatus({
      message: "Old password doesn't match",
      status: 400
    })
  }

  await usersService.changePassword(user_id, new_password)
  return res.status(200).json({ message: 'Change password success' })
}

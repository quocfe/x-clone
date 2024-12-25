import { Router } from 'express'
import {
  changePasswordController,
  followUserController,
  forgotPasswordController,
  getProfileController,
  loginController,
  logoutController,
  meController,
  refreshTokenController,
  registerController,
  resendVerifyEmailController,
  resetPasswordController,
  unFollowUserController,
  updateMeController,
  verifyEmailController,
  verifyForgotPasswordController
} from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  changePasswordValidator,
  followValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  unfollowValidator,
  updateMeValidator,
  verifyEmailValidator,
  verifyForgotPasswordValidator,
  verifyUserValidator
} from '~/middlewares/users.middlewares'
import tryCatch from '~/utils/tryCatch'

const usersRouter = Router()

usersRouter.post('/register', registerValidator, tryCatch(registerController))
usersRouter.post('/login', loginValidator, tryCatch(loginController))
usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, tryCatch(logoutController))
usersRouter.post('/refresh_token', refreshTokenValidator, tryCatch(refreshTokenController))
usersRouter.post('/verify_email', verifyEmailValidator, tryCatch(verifyEmailController))
usersRouter.post('/resend_verify_email', accessTokenValidator, tryCatch(resendVerifyEmailController))
usersRouter.post('/forgot_password', forgotPasswordValidator, tryCatch(forgotPasswordController))
usersRouter.post('/change_password', accessTokenValidator, changePasswordValidator, tryCatch(changePasswordController))
usersRouter.post('/verify_forgot_password', verifyForgotPasswordValidator, tryCatch(verifyForgotPasswordController))
usersRouter.post('/reset_password', resetPasswordValidator, tryCatch(resetPasswordController))
usersRouter.get('/me', accessTokenValidator, tryCatch(meController))
usersRouter.patch('/me', accessTokenValidator, verifyUserValidator, updateMeValidator, tryCatch(updateMeController))
usersRouter.get('/:username', tryCatch(getProfileController))
usersRouter.post('/follow', accessTokenValidator, verifyUserValidator, followValidator, tryCatch(followUserController))
usersRouter.delete('/follow/:user_id', accessTokenValidator, unfollowValidator, tryCatch(unFollowUserController))

export default usersRouter

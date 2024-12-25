import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import { envConfig } from '~/constants/config'
import { UserVerifyStatus } from '~/constants/enum'
import { REGEX_USERNAME } from '~/constants/regex'
import { ErrorWithStatus } from '~/models/Errors'
import { TokenPayload } from '~/models/requests/User.requests'
import dataBaseService from '~/services/database.service'
import usersService from '~/services/users.service'
import { hashPassword } from '~/utils/crypto'
import { verifyToken } from '~/utils/jwt'
import { validate } from '~/utils/validation'

export const loginValidator = validate(
  checkSchema(
    {
      email: {
        notEmpty: {
          errorMessage: 'Email không được để trống.'
        },
        isEmail: {
          errorMessage: 'Email không hợp lệ.'
        },
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            const user = await dataBaseService.users.findOne({
              email: value,
              password: hashPassword(req.body.password)
            })
            if (!user) {
              throw new Error('Email hoặc mật khẩu không đúng')
            }
            req.user = user
          }
        }
      },
      password: {
        notEmpty: {
          errorMessage: 'Mật khẩu không được để trống'
        },
        isString: {}
      }
    },
    ['body']
  )
)

export const registerValidator = validate(
  checkSchema(
    {
      name: {
        notEmpty: {
          errorMessage: 'Tên không được để trống.'
        },
        isLength: {
          options: {
            min: 1,
            max: 100
          },
          errorMessage: 'Tên phải có độ dài từ 1 đến 100 ký tự.'
        },
        trim: true
      },
      email: {
        notEmpty: {
          errorMessage: 'Email không được để trống.'
        },
        isEmail: {
          errorMessage: 'Email không hợp lệ.'
        },
        trim: true,
        custom: {
          options: async (value: string) => {
            const isEmailExit = await usersService.checkEmailExists(value)
            if (isEmailExit) {
              throw new Error('mail dang ki roi')
            }
          }
        }
      },
      password: {
        notEmpty: {
          errorMessage: 'Mật khẩu không được để trống.'
        },
        isString: {
          errorMessage: 'Mật khẩu phải là một chuỗi ký tự.'
        },
        isLength: {
          options: {
            min: 6,
            max: 50
          },
          errorMessage: 'Mật khẩu phải có độ dài từ 6 đến 50 ký tự.'
        }
      },
      confirm_password: {
        notEmpty: {
          errorMessage: 'Xác nhận mật khẩu không được để trống.'
        },
        isString: {
          errorMessage: 'Xác nhận mật khẩu phải là một chuỗi ký tự.'
        },
        isLength: {
          options: {
            min: 6,
            max: 50
          },
          errorMessage: 'Xác nhận mật khẩu phải có độ dài từ 6 đến 50 ký tự.'
        },
        custom: {
          options: (value: string, { req }) => {
            if (value !== req.body.password) {
              throw new Error('Mật khẩu không khớp')
            }
            return true
          }
        }
      },
      date_of_birth: {
        isISO8601: {
          options: {
            strict: true,
            strictSeparator: true
          },
          errorMessage: 'Ngày sinh không hợp lệ. Định dạng phải là ISO8601 (YYYY-MM-DD).'
        }
      }
    },
    ['body']
  )
)

export const accessTokenValidator = validate(
  checkSchema({
    Authorization: {
      trim: true,
      custom: {
        options: async (value: string, { req }) => {
          if (!value) {
            throw new ErrorWithStatus({
              message: 'Access token is required',
              status: 401
            })
          }
          const access_token = value.split(' ')[1]
          try {
            const decoded_authorization = await verifyToken({
              token: access_token,
              secretOrPublicKey: envConfig.JWT_SECRET_ACCESS_TOKEN as string
            })
            req.decoded_authorization = decoded_authorization
            return true
          } catch (error) {
            throw new ErrorWithStatus({
              message: (error as JsonWebTokenError).message,
              status: 401
            })
          }
        }
      }
    }
  })
)

export const refreshTokenValidator = validate(
  checkSchema(
    {
      refresh_token: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: 'Refresh token is required',
                status: 401
              })
            }
            try {
              const [decoded_refresh_token, refresh_token] = await Promise.all([
                verifyToken({ token: value, secretOrPublicKey: envConfig.JWT_SECRET_REFRESH_TOKEN as string }),
                dataBaseService.refeshTokens.findOne({ token: value })
              ])

              if (refresh_token === null) {
                throw new ErrorWithStatus({
                  message: 'Refresh token is used and not exits',
                  status: 401
                })
              }

              req.decoded_refresh_token = decoded_refresh_token
              return true
            } catch (error) {
              throw new ErrorWithStatus({
                message: (error as JsonWebTokenError).message,
                status: 401
              })
            }
          }
        }
      }
    },
    ['body']
  )
)

export const verifyEmailValidator = validate(
  checkSchema({
    email_verify_token: {
      trim: true,
      custom: {
        options: async (value: string, { req }) => {
          if (!value) {
            throw new ErrorWithStatus({
              message: 'Email verify token is required',
              status: 401
            })
          }
          try {
            const decoded_email_verify_token = await verifyToken({
              token: value,
              secretOrPublicKey: envConfig.JWT_SECRET_EMAIL_VERIFY_TOKEN as string
            })

            req.decoded_email_verify_token = decoded_email_verify_token
            return true
          } catch (error) {
            throw new ErrorWithStatus({
              message: (error as JsonWebTokenError).message,
              status: 401
            })
          }
        }
      }
    }
  })
)

export const forgotPasswordValidator = validate(
  checkSchema(
    {
      email: {
        trim: true,
        isEmail: {
          errorMessage: 'Email is invalid.'
        },
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: 'Email is required',
                status: 401
              })
            }
            const user = await dataBaseService.users.findOne({ email: value })
            if (user === null) {
              throw new ErrorWithStatus({
                message: 'Email not found',
                status: 401
              })
            }
            req.user = user
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const verifyForgotPasswordValidator = validate(
  checkSchema(
    {
      forgot_password_token: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: 'Forgotpassword token is required',
                status: 401
              })
            }
            try {
              const decoded_forgot_password_verify_token = await verifyToken({
                token: value,
                secretOrPublicKey: envConfig.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string
              })
              const { user_id } = decoded_forgot_password_verify_token
              const user = await dataBaseService.users.findOne({
                _id: new ObjectId(user_id as string)
              })

              if (user === null) {
                throw new ErrorWithStatus({
                  message: 'User not found',
                  status: 401
                })
              }

              if (user.forgot_password_token === '') {
                throw new ErrorWithStatus({
                  message: 'Forgot password token is used and not exits',
                  status: 401
                })
              }

              req.user = user
              return true
            } catch (error) {
              throw new ErrorWithStatus({
                message: (error as JsonWebTokenError).message,
                status: 401
              })
            }
          }
        }
      }
    },
    ['body']
  )
)

export const resetPasswordValidator = validate(
  checkSchema({
    password: {
      notEmpty: {
        errorMessage: 'Mật khẩu không được để trống.'
      },
      isString: {
        errorMessage: 'Mật khẩu phải là một chuỗi ký tự.'
      },
      isLength: {
        options: {
          min: 6,
          max: 50
        },
        errorMessage: 'Mật khẩu phải có độ dài từ 6 đến 50 ký tự.'
      }
    },
    confirm_password: {
      notEmpty: {
        errorMessage: 'Xác nhận mật khẩu không được để trống.'
      },
      isString: {
        errorMessage: 'Xác nhận mật khẩu phải là một chuỗi ký tự.'
      },
      isLength: {
        options: {
          min: 6,
          max: 50
        },
        errorMessage: 'Xác nhận mật khẩu phải có độ dài từ 6 đến 50 ký tự.'
      },
      custom: {
        options: (value: string, { req }) => {
          if (value !== req.body.password) {
            throw new Error('Mật khẩu không khớp')
          }
          return true
        }
      }
    },
    forgot_password_token: {
      trim: true,
      custom: {
        options: async (value: string, { req }) => {
          if (!value) {
            throw new ErrorWithStatus({
              message: 'Forgotpassword token is required',
              status: 401
            })
          }
          try {
            const decoded_forgot_password_verify_token = await verifyToken({
              token: value,
              secretOrPublicKey: envConfig.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string
            })
            const { user_id } = decoded_forgot_password_verify_token
            const user = await dataBaseService.users.findOne({
              _id: new ObjectId(user_id as string)
            })

            if (user === null) {
              throw new ErrorWithStatus({
                message: 'User not found',
                status: 401
              })
            }

            if (user.forgot_password_token === '') {
              throw new ErrorWithStatus({
                message: 'Forgot password token is used and not exits',
                status: 401
              })
            }

            req.decoded_forgot_password_verify_token = decoded_forgot_password_verify_token
            return true
          } catch (error) {
            throw new ErrorWithStatus({
              message: (error as JsonWebTokenError).message,
              status: 401
            })
          }
        }
      }
    }
  })
)

export const verifyUserValidator = (req: Request, res: Response, next: NextFunction) => {
  const { verify } = req.decoded_authorization as TokenPayload
  if (verify === UserVerifyStatus.Unverified) {
    return next(new ErrorWithStatus({ message: 'User is not verified', status: 403 }))
  }
  next()
}

export const updateMeValidator = validate(
  checkSchema(
    {
      name: {
        optional: true,
        isString: {
          errorMessage: 'Name is string'
        },
        trim: true
      },
      date_of_birth: {
        optional: true,
        isISO8601: {
          options: {
            strict: true,
            strictSeparator: true
          },
          errorMessage: 'Date of birth is ISO8601 (YYYY-MM-DD)'
        },
        trim: true
      },
      bio: {
        optional: true,
        isString: {
          errorMessage: 'bio is string'
        },
        trim: true,
        isLength: {
          options: {
            min: 1,
            max: 100
          },
          errorMessage: 'Length of bio must be between 1 and 100'
        }
      },
      location: {
        optional: true,
        isString: {
          errorMessage: 'location is string'
        },
        trim: true
      },
      website: {
        optional: true,
        isString: {
          errorMessage: 'website is string'
        },
        trim: true
      },
      username: {
        optional: true,
        isString: {
          errorMessage: 'username is string'
        },
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!REGEX_USERNAME.test(value)) {
              throw Error('Username is not valid')
            }
            const user = await dataBaseService.users.findOne({
              username: value
            })
            if (user !== null) {
              throw Error('Username already exists')
            }
            return true
          }
        }
      },
      avatar: {
        optional: true,
        isString: {
          errorMessage: 'avatar is string'
        },
        trim: true
      },
      cover_photo: {
        optional: true,
        isString: {
          errorMessage: 'cover photo is string'
        },
        trim: true
      }
    },
    ['body']
  )
)

export const followValidator = validate(
  checkSchema(
    {
      followed_user_id: {
        custom: {
          options: async (value: string, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: 'user_id is required',
                status: 400
              })
            }
            if (value === req.decoded_authorization.user_id) {
              throw new ErrorWithStatus({
                message: 'You can not follow yourself',
                status: 400
              })
            }
            const [user, followed] = await Promise.all([
              dataBaseService.users.findOne({ _id: new ObjectId(value) }),
              dataBaseService.follows.findOne({
                user_id: new ObjectId(req.decoded_authorization.user_id as string),
                followed_user_id: new ObjectId(value)
              })
            ])

            if (followed) {
              throw new ErrorWithStatus({
                message: 'You are already following this user',
                status: 400
              })
            }

            if (!user) {
              throw new ErrorWithStatus({
                message: 'User not found',
                status: 404
              })
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const unfollowValidator = validate(
  checkSchema(
    {
      user_id: {
        custom: {
          options: async (value: string, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: 'user_id is required',
                status: 400
              })
            }
            if (value === req.decoded_authorization.user_id) {
              throw new ErrorWithStatus({
                message: 'You can not unfollow yourself',
                status: 400
              })
            }
            const [user, followed] = await Promise.all([
              dataBaseService.users.findOne({ _id: new ObjectId(value) }),
              dataBaseService.follows.findOne({
                user_id: new ObjectId(req.decoded_authorization.user_id as string),
                followed_user_id: new ObjectId(value)
              })
            ])

            if (!followed) {
              throw new ErrorWithStatus({
                message: 'You aren"t following this user',
                status: 400
              })
            }

            if (!user) {
              throw new ErrorWithStatus({
                message: 'User not found',
                status: 404
              })
            }
            req.body = followed
            return true
          }
        }
      }
    },
    ['params']
  )
)

export const changePasswordValidator = validate(
  checkSchema(
    {
      password: {
        notEmpty: {
          errorMessage: 'Mật khẩu không được để trống.'
        },
        isString: {
          errorMessage: 'Mật khẩu phải là một chuỗi ký tự.'
        },
        isLength: {
          options: {
            min: 6,
            max: 50
          },
          errorMessage: 'Mật khẩu phải có độ dài từ 6 đến 50 ký tự.'
        }
      },
      confirm_password: {
        notEmpty: {
          errorMessage: 'Xác nhận mật khẩu không được để trống.'
        },
        isString: {
          errorMessage: 'Xác nhận mật khẩu phải là một chuỗi ký tự.'
        },
        isLength: {
          options: {
            min: 6,
            max: 50
          },
          errorMessage: 'Xác nhận mật khẩu phải có độ dài từ 6 đến 50 ký tự.'
        },
        custom: {
          options: (value: string, { req }) => {
            if (value !== req.body.password) {
              throw new Error('Password does not match')
            }

            return true
          }
        }
      },
      new_password: {
        notEmpty: {
          errorMessage: 'Mật khẩu không được để trống.'
        },
        isString: {
          errorMessage: 'Mật khẩu phải là một chuỗi ký tự.'
        },
        isLength: {
          options: {
            min: 6,
            max: 50
          },
          errorMessage: 'Mật khẩu phải có độ dài từ 6 đến 50 ký tự.'
        },
        custom: {
          options: (value: string, { req }) => {
            if (value === req.body.password) {
              throw new Error('New password must be different from old password')
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const isUserLoggedMiddleware = (middleWare: (req: Request, res: Response, next: NextFunction) => void) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.headers.authorization) {
      return middleWare(req, res, next)
    }
    next()
  }
}

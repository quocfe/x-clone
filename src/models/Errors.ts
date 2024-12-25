import httpStatus from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/message'

type ErrosType = Record<
  string,
  {
    msg: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any
  }
>

export class ErrorWithStatus {
  message: string
  status: number
  constructor({ message, status }: { message: string; status: number }) {
    this.message = message
    this.status = status
  }
}

export class EntityError extends ErrorWithStatus {
  errors: ErrosType
  constructor({ message = USERS_MESSAGES.VALIDATION_ERROR, errors }: { message?: string; errors: ErrosType }) {
    super({ message, status: httpStatus.UNPROCESSABLE_ENTITY })
    this.errors = errors
  }
}

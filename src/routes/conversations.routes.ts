import { Router } from 'express'
import { getConversationsController, sendMessageController } from '~/controllers/conversations.controllers'
import { accessTokenValidator, verifyUserValidator } from '~/middlewares/users.middlewares'
import tryCatch from '~/utils/tryCatch'

const conversationsRouter = Router()
conversationsRouter.get(
  '/receiver/:receiver_id',
  accessTokenValidator,
  verifyUserValidator,
  tryCatch(getConversationsController)
)
conversationsRouter.post('/sendMessage', accessTokenValidator, verifyUserValidator, tryCatch(sendMessageController))

export default conversationsRouter

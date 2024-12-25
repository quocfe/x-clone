import { Request, Response } from 'express'
import { TokenPayload } from '~/models/requests/User.requests'
import { conversationsService } from '~/services/conversations.service'

export const getConversationsController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { receiver_id } = req.params
  const messsages = await conversationsService.getConversations(user_id, receiver_id)
  return res.status(200).json({ message: 'get messsages success', data: messsages })
}

export const sendMessageController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { reciver_id, message } = req.body
  const messsages = await conversationsService.sendMessage(user_id, reciver_id, message)
  return res.status(200).json({ message: 'send messsages success', data: messsages })
}

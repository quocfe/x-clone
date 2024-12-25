import { ObjectId } from 'mongodb'
import Conversation from '~/models/schema/Conversation.schema'
import dataBaseService from '~/services/database.service'

class Conversations {
  async getConversations(user_id: string, reciver_id: string) {
    const resutl = await dataBaseService.conversations
      .find({
        sender_id: new ObjectId(user_id),
        receiver_id: new ObjectId(reciver_id)
      })
      .toArray()
    return resutl
  }

  async sendMessage(user_id: string, reciver_id: string, message: string) {
    const resutl = await dataBaseService.conversations.insertOne(
      new Conversation({
        sender_id: new ObjectId(user_id),
        receiver_id: new ObjectId(reciver_id),
        content: message,
        created_at: new Date(),
        updated_at: new Date()
      })
    )
    return resutl
  }
}

export default Conversations

export const conversationsService = new Conversations()

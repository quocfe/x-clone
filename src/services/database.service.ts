import { Collection, Db, MongoClient } from 'mongodb'
import { envConfig } from '~/constants/config'
import BookMark from '~/models/schema/BookMark.schema'
import Conversation from '~/models/schema/Conversation.schema'
import Follow from '~/models/schema/Follow.schema'
import HashTag from '~/models/schema/HashTags.schema'
import RefreshToken from '~/models/schema/RefreshToken.schema'
import Tweet from '~/models/schema/Tweet.schema'
import User from '~/models/schema/User.schema'

const uri = `mongodb+srv://${envConfig.DB_USERNAME}:${envConfig.DB_PASS}@cluster0.vwhdn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

class DataBaseService {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(envConfig.DB_NAME)
  }

  async connect() {
    try {
      // Connect the client to the server	(optional starting in v4.7)
      await this.client.connect()
      // Send a ping to confirm a successful connection
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      console.log('error', error)
      throw error
      // Ensures that the client will close when you finish/error
      // await this.client.close()
    }
  }

  indexUsers() {
    this.users.createIndex({ email: 1, password: 1 })
    this.users.createIndex({ email: 1 }, { unique: true })
    this.users.createIndex({ username: 1 }, { unique: true })
  }

  indexRefeshTokens() {
    this.refeshTokens.createIndex({ token: 1 })
    this.refeshTokens.createIndex(
      { exp: 1 },
      {
        expireAfterSeconds: 0
      }
    )
  }

  indexFollows() {
    this.follows.createIndex({ user_id: 1, followed_user_id: 1 })
  }

  get users(): Collection<User> {
    return this.db.collection(envConfig.DB_USERS_COLLECTION as string)
  }

  get refeshTokens(): Collection<RefreshToken> {
    return this.db.collection(envConfig.DB_REFRESH_TOKENS_COLLECTION as string)
  }

  get follows(): Collection<Follow> {
    return this.db.collection(envConfig.DB_FOLLOWS_COLLECTION as string)
  }

  get tweets(): Collection<Tweet> {
    return this.db.collection(envConfig.DB_TWEETS_COLLECTION as string)
  }

  get Hashtags(): Collection<HashTag> {
    return this.db.collection(envConfig.DB_HASHTAGS_COLLECTION as string)
  }

  get Bookmarks(): Collection<BookMark> {
    return this.db.collection(envConfig.DB_BOOKMARKS_COLLECTION as string)
  }

  get conversations(): Collection<Conversation> {
    return this.db.collection(envConfig.DB_CONVERSATIONS_COLLECTION as string)
  }
}

const dataBaseService = new DataBaseService()

export default dataBaseService

import { ObjectId } from 'mongodb'
import { ErrorWithStatus } from '~/models/Errors'
import BookMark from '~/models/schema/BookMark.schema'
import dataBaseService from '~/services/database.service'

class BookMarks {
  async createBookmarkTweet(user_id: string, tweet_id: string) {
    const result = await dataBaseService.Bookmarks.findOneAndUpdate(
      {
        user_id: new ObjectId(user_id),
        tweet_id: new ObjectId(tweet_id)
      },
      {
        $setOnInsert: new BookMark({ user_id: new ObjectId(user_id), tweet_id: new ObjectId(tweet_id) })
      },
      {
        upsert: true
      }
    )

    if (result) {
      throw new ErrorWithStatus({ message: 'Bookmark have been created', status: 409 })
    }
    return result
  }

  async unBookmarkTweet(user_id: string, tweet_id: string) {
    const result = await dataBaseService.Bookmarks.findOneAndDelete({
      user_id: new ObjectId(user_id),
      tweet_id: new ObjectId(tweet_id)
    })
    return result
  }
}

export default BookMarks

export const bookmarksService = new BookMarks()

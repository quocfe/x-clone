import { Request, Response } from 'express'
import { TokenPayload } from '~/models/requests/User.requests'
import { bookmarksService } from '~/services/bookmarks.service'

export const createBookmarkTweetController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { tweet_id } = req.body
  await bookmarksService.createBookmarkTweet(user_id, tweet_id)

  return res.status(200).json({ message: 'Create bookmark tweet success' })
}

export const unBookmarkTweetController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { tweet_id } = req.params
  const result = await bookmarksService.unBookmarkTweet(user_id, tweet_id)

  return res.status(200).json({ message: 'Unbookmark tweet success', result })
}

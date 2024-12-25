import { Router } from 'express'
import { createBookmarkTweetController, unBookmarkTweetController } from '~/controllers/bookmarks.controllers'
import { tweetIdValidator } from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, verifyUserValidator } from '~/middlewares/users.middlewares'
import tryCatch from '~/utils/tryCatch'

const bookMarksRouter = Router()
bookMarksRouter.post(
  '/tweet',
  accessTokenValidator,
  verifyUserValidator,
  tweetIdValidator,
  tryCatch(createBookmarkTweetController)
)
bookMarksRouter.delete(
  '/tweet/:tweet_id',
  accessTokenValidator,
  verifyUserValidator,
  tweetIdValidator,
  tryCatch(unBookmarkTweetController)
)
export default bookMarksRouter

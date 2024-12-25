import { Router } from 'express'
import {
  createTweetController,
  getNewFeedsController,
  getTweetChildrenController,
  getTweetController
} from '~/controllers/tweets.controllers'
import {
  audienceValidator,
  createTweetValidator,
  getTweetChildrenValidator,
  paginationValidator,
  tweetIdValidator
} from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, isUserLoggedMiddleware, verifyUserValidator } from '~/middlewares/users.middlewares'
import tryCatch from '~/utils/tryCatch'

const tweetsRouter = Router()

tweetsRouter.post('/', accessTokenValidator, verifyUserValidator, createTweetValidator, createTweetController)

tweetsRouter.get('/', paginationValidator, accessTokenValidator, verifyUserValidator, tryCatch(getNewFeedsController))

tweetsRouter.get(
  '/:tweet_id',
  tweetIdValidator,
  isUserLoggedMiddleware(accessTokenValidator),
  isUserLoggedMiddleware(verifyUserValidator),
  audienceValidator,
  getTweetController
)
tweetsRouter.get(
  '/:tweet_id/children',
  tweetIdValidator,
  paginationValidator,
  getTweetChildrenValidator,
  isUserLoggedMiddleware(accessTokenValidator),
  isUserLoggedMiddleware(verifyUserValidator),
  audienceValidator,
  tryCatch(getTweetChildrenController)
)

export default tweetsRouter

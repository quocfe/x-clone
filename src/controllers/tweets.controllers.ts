import { Request, Response } from 'express'
import { TweetType } from '~/constants/enum'
import { Pagination, TweetParam, TweetQuery } from '~/models/requests/Tweet.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import { tweetsService } from '~/services/tweets.service'

export const createTweetController = async (req: Request, res: Response) => {
  const body = req.body
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await tweetsService.createTweet(user_id, body)
  return res.status(200).json({
    message: 'Create tweet success',
    result
  })
}

export const getTweetController = async (req: Request, res: Response) => {
  const views = await tweetsService.increaseViewTweet(req.params.tweet_id, req.decoded_authorization?.user_id)
  const tweets = {
    ...req.tweet,
    user_views: views.user_views,
    guest_views: views.guest_views
  }
  return res.status(200).json({
    message: 'get tweet success',
    result: tweets
  })
}

export const getTweetChildrenController = async (req: Request<TweetParam, any, any, TweetQuery>, res: Response) => {
  const tweet_type = Number(req.query.tweet_type) as TweetType
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const user_id = req.decoded_authorization?.user_id
  const { total, tweets } = await tweetsService.getTweetChildren({
    tweet_id: req.params.tweet_id,
    tweet_type,
    limit,
    page,
    user_id
  })
  return res.json({
    message: 'Get Tweet Children Successfully',
    result: {
      tweets,
      tweet_type,
      limit,
      page,
      total_page: Math.ceil(total / limit)
    }
  })
}

export const getNewFeedsController = async (req: Request<TweetParam, any, any, Pagination>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const result = await tweetsService.getNewFeeds({
    user_id,
    limit,
    page
  })

  return res.status(200).json({
    message: 'Get New Feeds Successfully',
    result: {
      tweets: result.tweets,
      limit,
      page,
      total_page: Math.ceil(result.total / limit)
    }
  })
}

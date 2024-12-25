import { Pagination } from '~/models/requests/Tweet.requests'
import { Query } from 'express-serve-static-core'
import { MediaTypeQuery, PeopleFollow } from '~/constants/enum'
export interface SearchQuery extends Pagination, Query {
  content: string
  media_type?: MediaTypeQuery
  people_follow?: PeopleFollow
}

import { ObjectId } from 'mongodb'

interface FollowType {
  _id?: ObjectId
  user_id: ObjectId
  followed_user_id: ObjectId
  created_at?: Date
}

export default class Follow {
  _id?: ObjectId
  followed_user_id: ObjectId
  user_id: ObjectId
  created_at?: Date
  constructor({ _id, user_id, created_at, followed_user_id }: FollowType) {
    this._id = _id
    this.followed_user_id = followed_user_id
    this.created_at = created_at || new Date()
    this.user_id = user_id
  }
}

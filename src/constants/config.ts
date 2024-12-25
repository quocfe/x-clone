import { config } from 'dotenv'
const env = process.env.NODE_ENV
export const isProduction = Boolean(env === 'production')

config({
  path: env ? `.env.${env}` : '.env'
})

export const envConfig = {
  PORT: process.env.PORT || 3000,
  HOST: process.env.HOST || 'https://example.com',
  DB_USERNAME: process.env.DB_USERNAME || 'luti0510',
  DB_PASS: process.env.DB_PASS || 'Nguyenphuquoc123',
  DB_NAME: process.env.DB_NAME || 'XApi',
  CLIENT_URL: process.env.CLIENT_URL,
  DB_USERS_COLLECTION: process.env.DB_USERS_COLLECTION || 'users',
  DB_REFRESH_TOKENS_COLLECTION: process.env.DB_REFRESH_TOKENS_COLLECTION || 'refresh_tokens',
  DB_FOLLOWS_COLLECTION: process.env.DB_FOLLOWS_COLLECTION || 'follows',
  DB_TWEETS_COLLECTION: process.env.DB_TWEETS_COLLECTION || 'tweets',
  DB_HASHTAGS_COLLECTION: process.env.DB_HASHTAGS_COLLECTION || 'hashtags',
  DB_BOOKMARKS_COLLECTION: process.env.DB_BOOKMARKS_COLLECTION || 'bookmarks',
  DB_CONVERSATIONS_COLLECTION: process.env.DB_CONVERSATIONS_COLLECTION || 'conversations',

  PASSWORD_SALT: process.env.PASSWORD_SALT,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_SECRET_ACCESS_TOKEN: process.env.JWT_SECRET_ACCESS_TOKEN,
  JWT_SECRET_REFRESH_TOKEN: process.env.JWT_SECRET_REFRESH_TOKEN,
  JWT_SECRET_EMAIL_VERIFY_TOKEN: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN,
  JWT_SECRET_FORGOT_PASSWORD_TOKEN: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN,

  ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN,

  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_REGION: process.env.AWS_REGION,
  SES_FROM_ADDRESS: process.env.SES_FROM_ADDRESS,
  AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME
}

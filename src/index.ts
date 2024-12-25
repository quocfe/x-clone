import cors from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import morgan from 'morgan'
import { envConfig, isProduction } from '~/constants/config'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import { defaultErrorHandler } from '~/middlewares/error.middlewares'
import bookMarksRouter from '~/routes/bookmarks.routes'
import conversationsRouter from '~/routes/conversations.routes'
import mediasRouter from '~/routes/medias.routes'
import searchRouter from '~/routes/search.routes'
import staticsRouter from '~/routes/statics.routes'
import tweetsRouter from '~/routes/tweets.routes'
import usersRouter from '~/routes/users.routes'
import dataBaseService from '~/services/database.service'
import { initFolder } from '~/utils/file'
import swaggerUi from 'swagger-ui-express'
import swaggerJsdoc from 'swagger-jsdoc'
// import '~/utils/fake'
// import '~/utils/s3'
// Load environment variables

const app = express()
const PORT = envConfig.PORT || 3000
// init folder
initFolder()

const corsOptions = {
  origin: isProduction ? envConfig.CLIENT_URL : '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204
}
// Middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
  legacyHeaders: false // Disable the `X-RateLimit-*` headers.
  // store: ... , // Redis, Memcached, etc. See below.
})

// Apply the rate limiting middleware to all requests.
app.use(limiter)
app.use(cors(corsOptions)) // Enable CORS
app.use(helmet())
app.use(express.json()) // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })) // Parse URL-encoded request bodies
app.use(morgan('dev')) // Log HTTP requests

// connect db
dataBaseService.connect().then(() => {
  dataBaseService.indexUsers()
  dataBaseService.indexRefeshTokens()
  dataBaseService.indexFollows()
})

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'X clone (Twitter API)',
      version: '1.0.0'
    },
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        BearerAuth: []
      }
    ],
    persistAuthorization: true
  },
  apis: ['./openapi/*.yaml'] // files containing annotations as above
}
const openapiSpecification = swaggerJsdoc(options)

// Routes
app.use(express.json())
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification))
app.use('/users', usersRouter)
app.use('/medias', mediasRouter)
app.use('/tweets', tweetsRouter)
app.use('/static', staticsRouter)
app.use('/search', searchRouter)
app.use('/conversations', conversationsRouter)
app.use('/bookmarks', bookMarksRouter)
app.use('/static/video', express.static(UPLOAD_VIDEO_DIR))
// static file
app.use('/uploads/images', express.static(UPLOAD_IMAGE_DIR))
app.use('/uploads/videos', express.static(UPLOAD_VIDEO_DIR))
app.use('/videos', express.static(UPLOAD_VIDEO_DIR))
// defaut error hanlder
app.use(defaultErrorHandler)

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

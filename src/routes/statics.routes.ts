import { Router } from 'express'
import { serveImageController, serveStreamVideoController } from '~/controllers/statics.controllers'

const staticsRouter = Router()

staticsRouter.get('/image/:name', serveImageController)
staticsRouter.get('/video-stream/:name', serveStreamVideoController)

export default staticsRouter

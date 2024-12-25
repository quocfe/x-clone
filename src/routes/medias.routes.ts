import { Router } from 'express'
import { uploadImagesController, uploadVideoController } from '~/controllers/medias.controllers'
import { accessTokenValidator, verifyUserValidator } from '~/middlewares/users.middlewares'
import tryCatch from '~/utils/tryCatch'

const mediasRouter = Router()

mediasRouter.post('/upload_images', accessTokenValidator, verifyUserValidator, tryCatch(uploadImagesController))
mediasRouter.post('/upload_video', accessTokenValidator, verifyUserValidator, tryCatch(uploadVideoController))

export default mediasRouter

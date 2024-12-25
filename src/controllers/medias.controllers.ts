import { NextFunction, Request, Response } from 'express'
import mediasService from '~/services/medias.service'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const uploadImagesController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await mediasService.uploadImages(req)
  return res.status(200).json({ message: 'Upload images success', data: result })
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const uploadVideoController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await mediasService.uploadVideo(req)
  return res.status(200).json({ message: 'Upload videosuccess ', data: result })
}

import { CompleteMultipartUploadCommandOutput } from '@aws-sdk/client-s3'
import { config } from 'dotenv'
import { Request } from 'express'
import fsPromise from 'fs/promises'
import mime from 'mime'
import path from 'path'
import sharp from 'sharp'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import { MediaType } from '~/constants/enum'
import { getNameFromFullName, handleUploadImages, handleUploadVideo } from '~/utils/file'
import { uploadFileToS3 } from '~/utils/s3'

config()

class MediasService {
  async uploadImages(req: Request) {
    const files = await handleUploadImages(req)
    const result = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullName(file.newFilename)
        const newNameFileName = `${newName}.jpg`
        const newPath = path.resolve(UPLOAD_IMAGE_DIR, newNameFileName)
        await sharp(file.filepath).toFormat('jpeg').toFile(newPath)
        const s3Url = await uploadFileToS3({
          filename: 'images' + '/' + newNameFileName,
          filepath: newPath,
          contentType: mime.getType(newPath) as string
        })
        await Promise.all([fsPromise.unlink(file.filepath), fsPromise.unlink(newPath)])
        return {
          url: (s3Url as CompleteMultipartUploadCommandOutput).Location,
          type: MediaType.Image
        }
        // return {
        //   url: isProduction
        //     ? `${envConfig.HOST}/static/image/${newName}.jpeg}`
        //     : `http://localhost:${envConfig.PORT}/static/image/${newName}.jpeg`,
        //   type: MediaType.Image
        // }
      })
    )

    return result
  }

  async uploadVideo(req: Request) {
    const files = await handleUploadVideo(req)
    const { newFilename, filepath } = files[0]
    const s3Url = await uploadFileToS3({
      filename: 'videos' + '/' + newFilename,
      filepath: filepath,
      contentType: mime.getType(filepath) as string
    })
    const newPath = path.resolve(UPLOAD_VIDEO_DIR, newFilename)
    await Promise.all([fsPromise.unlink(filepath), fsPromise.unlink(newPath)])
    return {
      url: s3Url.Location,
      type: MediaType.Video
    }
  }
}

const mediasService = new MediasService()

export default mediasService

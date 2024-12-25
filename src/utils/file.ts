import { Request } from 'express'
import { File } from 'formidable'
import fs from 'fs'
import { UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_DIR, UPLOAD_VIDEO_TEMP_DIR } from '~/constants/dir'
export const initFolder = () => {
  const uploadFolderPathImage = UPLOAD_IMAGE_TEMP_DIR
  const uploadFolderPathVideo = UPLOAD_VIDEO_TEMP_DIR
  if (!fs.existsSync(uploadFolderPathImage)) {
    fs.mkdirSync(uploadFolderPathImage, {
      recursive: true // mục đích để tạo folder nested
    })
  }
  if (!fs.existsSync(uploadFolderPathVideo)) {
    fs.mkdirSync(uploadFolderPathVideo, {
      recursive: true // mục đích để tạo folder nested
    })
  }
}

export const handleUploadImages = async (req: Request) => {
  const formidable = (await import('formidable')).default
  const form = formidable({
    uploadDir: UPLOAD_IMAGE_TEMP_DIR,
    maxFiles: 4,
    keepExtensions: true,
    multiples: true,
    maxFileSize: 30 * 1024 * 1024, // 3MB
    maxTotalFileSize: 4 * 30 * 1024 * 1024,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    filter: function ({ name, originalFilename, mimetype }) {
      // keep only images
      const valid = name === 'image' && Boolean(mimetype?.includes('image'))
      if (!valid) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        form.emit('error' as any, new Error('Invalid file type') as any)
      }

      return valid
    }
  })

  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err)
      }
      // eslint-disable-next-line no-extra-boolean-cast
      if (!Boolean(files.image)) {
        reject(new Error('File is empty'))
      }

      resolve(files.image as File[])
    })
  })
}

export const handleUploadVideo = async (req: Request) => {
  const formidable = (await import('formidable')).default
  const form = formidable({
    uploadDir: UPLOAD_VIDEO_DIR,
    maxFiles: 1,
    keepExtensions: true,
    maxFileSize: 30 * 1024 * 1024, // 30MB
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    filter: function ({ name, originalFilename, mimetype }) {
      // keep only images
      const valid = name === 'video' && Boolean(mimetype?.includes('video') || mimetype?.includes('quicktime'))
      if (!valid) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        form.emit('error' as any, new Error('Invalid file type') as any)
      }

      return valid
    }
  })

  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err)
      }
      // eslint-disable-next-line no-extra-boolean-cast
      if (!Boolean(files.video)) {
        reject(new Error('Video is empty'))
      }

      resolve(files.video as File[])
    })
  })
}

export const getNameFromFullName = (fullName: string) => {
  const nameArr = fullName.split('.')
  nameArr.pop()
  return nameArr.join('')
}

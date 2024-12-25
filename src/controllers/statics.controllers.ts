import { NextFunction, Request, Response } from 'express'
import fs from 'fs'
import mime from 'mime'
import path from 'path'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const serveImageController = (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.params
  return res.sendFile(path.resolve(UPLOAD_IMAGE_DIR, name), (err) => {
    if (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      res.status((err as any).status).send('not found')
    }
  })
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const serveStreamVideoController = (req: Request, res: Response, next: NextFunction) => {
  const range = req.headers.range
  if (!range) {
    return res.status(400).send('Requires Range header')
  }
  const { name } = req.params
  const videoPath = path.resolve(UPLOAD_VIDEO_DIR, name)
  // 1MB = 10^6 bytes (tính theo hệ 10 )
  // theo hệ nhị phân: 1MB = 2^20 bytes (1024 * 1024)

  // Dung lượng video (bytes)
  const videoSize = fs.statSync(videoPath).size
  // Dung lượng cho mỗi đoạn stream
  const chunkSize = 10 * 1024 * 1024
  // Lấy giá trị byte bắt đầu
  const start = Number(range.replace(/\D/g, ''))
  // Lấy giá trị byte kết thúc
  const end = Math.min(start + chunkSize, videoSize - 1)
  // Dung lượng thực tế cho mỗi đoạn stream
  const contentLength = end - start + 1
  const contentType = mime.getType(videoPath) || 'video/*'

  const head = {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': contentType
  }
  res.writeHead(206, head)
  const videoStream = fs.createReadStream(videoPath, { start, end })
  videoStream.pipe(res)
}

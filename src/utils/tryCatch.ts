// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tryCatch = (fn: any) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return async (req: any, res: any, next: any) => {
    try {
      await fn(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}

export default tryCatch

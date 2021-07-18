import * as crypto from 'crypto'

const { WEBHOOK_KEY: key } = process.env

if (typeof key !== 'string') {
  throw new Error('Environment variables missing')
}

/** Verify a given secret against the expected secret for the webhook */
export const verifySecret = (secret: string, body: string): boolean => {
  const expectedSecret = crypto
    .createHmac('sha256', key)
    .update(body)
    .digest('hex')

  return expectedSecret === secret
}

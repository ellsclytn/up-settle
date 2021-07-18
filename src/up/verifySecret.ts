import env from 'env-var'
import * as crypto from 'crypto'
import timingSafeCompare from 'tsscmp'

const key = env.get('WEBHOOK_KEY').required().asString()

/** Verify a given secret against the expected secret for the webhook */
export const verifySecret = (secret: string, body: string): boolean => {
  const expectedSecret = crypto
    .createHmac('sha256', key)
    .update(body)
    .digest('hex')

  return timingSafeCompare(expectedSecret, secret)
}

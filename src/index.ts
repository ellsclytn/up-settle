import { APIGatewayProxyHandler } from 'aws-lambda'
import { decodeBase64 } from './decodeBase64'
import { TransactionHook } from './types/up/webhook/transaction'
import { isValidTransaction } from './up/validateTransaction'
import { verifySecret } from './up/verifySecret'

interface Response {
  statusCode: number
  body: string
}

const respond = (payload: any, statusCode = 200): Response => ({
  statusCode,
  body: JSON.stringify(payload)
})

export const handleTransaction: APIGatewayProxyHandler = async (
  event,
  _context
) => {
  if (event.body === null) {
    return respond({ status: 'Null payload, no action' })
  }

  const rawBody = event.isBase64Encoded ? decodeBase64(event.body) : event.body

  if (
    !verifySecret(
      event.headers['X-Up-Authenticity-Signature'] as string,
      rawBody
    )
  ) {
    return respond({ status: 'Unauthorized' }, 403)
  }

  const { data }: TransactionHook = JSON.parse(rawBody)

  if (data.attributes.eventType !== 'TRANSACTION_SETTLED') {
    return respond({ message: 'Transaction not settled, ignoring.' })
  }

  if (await isValidTransaction(data.relationships.transaction.links.related)) {
    // Do the stuff with Settle Up
    console.log('Transaction suitable for Settle Up!')
  }

  return respond({ status: 'OK' })
}

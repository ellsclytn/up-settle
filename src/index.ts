import env from 'env-var'
import { APIGatewayProxyHandler } from 'aws-lambda'
import { decodeBase64 } from './decodeBase64'
import { SettleUpApi } from './settleUp/api'
import { getUserAuth } from './settleUp/authentication'
import { TransactionHook } from './types/up/webhook/transaction'
import { findExpenseForTransaction } from './up/findExpenseForTransaction'
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

  const settleUpAuth = getUserAuth()
  const transaction = await findExpenseForTransaction(
    data.relationships.transaction.links.related
  )

  if (transaction !== null) {
    const settleUp = new SettleUpApi(await settleUpAuth)

    await settleUp.addTransaction({
      group: env.get('SETTLE_UP_GROUP').required().asString(),
      user: env.get('SETTLE_UP_USER').required().asString(),
      ...transaction
    })
  }

  return respond({ status: 'OK' })
}

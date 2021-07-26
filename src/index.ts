import env from 'env-var'
import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { decodeBase64 } from './decodeBase64'
import { SettleUpApi } from './settleUp/api'
import { getUserAuth } from './settleUp/authentication'
import { TransactionHook } from './types/up/webhook/transaction'
import { findExpenseForTransaction } from './up/findExpenseForTransaction'
import { verifySecret } from './up/verifySecret'

interface LoggedResponseOptions {
  message: string
  statusCode?: number
  [key: string]: any
}

function respond ({
  message,
  statusCode = 200,
  ...metadata
}: LoggedResponseOptions): APIGatewayProxyResult {
  const log = {
    ...metadata,
    message,
    statusCode
  }

  console.log(log)

  /* Avoid returning any extra detail to Up. A status code is enough info for
   * their logs. Everything else can stay in our logs
   */
  return { statusCode, body: '' }
}

export const handleTransaction: APIGatewayProxyHandler = async (
  event,
  _context
) => {
  if (event.body === null) {
    return respond({ message: 'Null payload, no action' })
  }

  const rawBody = event.isBase64Encoded ? decodeBase64(event.body) : event.body

  const authSignatureKey = 'X-Up-Authenticity-Signature'

  /* When I run it through my HTTP client it seems to lowercase the headers no
   * matter what. Therefore, this annoying thing.
   */
  const authSignature =
    event.headers[authSignatureKey] !== undefined
      ? event.headers[authSignatureKey]
      : event.headers[authSignatureKey.toLowerCase()]

  if (authSignature === undefined || !verifySecret(authSignature, rawBody)) {
    return respond({ message: 'Failed signature verification' })
  }

  const { data }: TransactionHook = JSON.parse(rawBody)

  if (data.relationships.transaction === undefined) {
    return respond({
      message: 'No Transaction data present, ignoring.',
      webhookId: data.id
    })
  }

  if (data.attributes.eventType !== 'TRANSACTION_SETTLED') {
    return respond({
      message: 'Transaction not settled, ignoring.',
      transactionId: data.relationships.transaction.data.id
    })
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

  return respond({ message: 'OK' })
}

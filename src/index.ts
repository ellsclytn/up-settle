import axios from 'axios'
import { APIGatewayProxyHandler } from 'aws-lambda'
import { decodeBase64 } from './decodeBase64'
import { TransactionHook } from './types/up/webhook/transaction'
import { Transaction } from './types/up/transaction'
import { verifySecret } from './verifySecret'

interface Response {
  statusCode: number
  body: string
}

interface TransactionResponse {
  data: Transaction
}

const { API_TOKEN: apiToken } = process.env

if (typeof apiToken !== 'string') {
  throw new Error('Environment variables missing')
}

const upClient = axios.create({
  baseURL: 'https://api.up.com.au/api/v1/',
  headers: {
    Authorization: `Bearer ${apiToken}`
  }
})

const getTransaction = async (url: string): Promise<Transaction> => {
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (process.env.FAKE_IT) {
    return require('../test/fixtures/settled-applicable-transaction.json')
  }

  const {
    data: { data: transaction }
  } = await upClient.get<TransactionResponse>(url)

  return transaction
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

  const transaction = await getTransaction(
    data.relationships.transaction.links.related
  )

  if (
    transaction.attributes.rawText.includes('VPN') &&
    transaction.attributes.foreignAmount?.currencyCode === 'EUR' &&
    transaction.attributes.foreignAmount?.value === '-5.00'
  ) {
    // Do the stuff with Settle Up
    console.log('Transaction suitable for Settle Up!')
  }

  return respond({ status: 'OK' })
}

import axios from 'axios'
import { Transaction } from '../types/up/transaction'

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

async function getTransaction (url: string): Promise<Transaction> {
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (process.env.FAKE_IT) {
    return require('../../test/fixtures/settled-applicable-transaction.json')
  }

  const {
    data: { data: transaction }
  } = await upClient.get<TransactionResponse>(url)

  return transaction
}

/** Given an Up Transaction URL, it will look up the transaction and return
 *  true if the Transaction is suitable for processing
 */
export async function isValidTransaction (url: string): Promise<boolean> {
  const transaction = await getTransaction(url)

  if (
    transaction.attributes.rawText.includes('VPN') &&
    transaction.attributes.foreignAmount?.currencyCode === 'EUR' &&
    transaction.attributes.foreignAmount?.value === '-5.00'
  ) {
    return true
  }

  return false
}

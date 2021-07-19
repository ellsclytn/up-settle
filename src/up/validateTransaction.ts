import axios from 'axios'
import env from 'env-var'
import { Transaction } from '../types/up/transaction'

interface TransactionResponse {
  data: Transaction
}

const apiToken = env.get('API_TOKEN').required().asString()

const upClient = axios.create({
  baseURL: 'https://api.up.com.au/api/v1/',
  headers: {
    Authorization: `Bearer ${apiToken}`
  }
})

async function getTransaction (url: string): Promise<Transaction> {
  if (env.get('FAKE_IT').default(0).asBool()) {
    return require('../../test/fixtures/settled-applicable-transaction.json')
  }

  const {
    data: { data: transaction }
  } = await upClient.get<TransactionResponse>(url)

  return transaction
}

/** Given an Up Transaction URL, it will look up the transaction and return
 *  the Transaction if suitable for processing, otherwise null
 */
export async function getValidTransaction (
  url: string
): Promise<Transaction | null> {
  const transaction = await getTransaction(url)

  if (
    transaction.attributes.rawText.includes('VPN') &&
    transaction.attributes.foreignAmount?.currencyCode === 'EUR' &&
    transaction.attributes.foreignAmount?.value === '-5.00'
  ) {
    return transaction
  }

  return null
}

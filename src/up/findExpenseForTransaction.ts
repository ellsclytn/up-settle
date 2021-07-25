import axios from 'axios'
import env from 'env-var'
import yaml from 'js-yaml'
import path from 'path'
import { promises as fs } from 'fs'
import { Transaction } from '../types/up/transaction'
import { Expense } from '../types/settleUp/expense'
import { ExpensesDictionary } from '../types/expensesDictionary'
import { transactionMatchesExpense } from './expenseLookup'

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

async function getExpensesDictionary (): Promise<ExpensesDictionary> {
  const expensesDictionaryPath = path.join('./', 'expenses.yml')
  const expensesDictionaryResponse = await fs
    .readFile(expensesDictionaryPath, 'utf8')
    .then(yaml.load)

  if (Array.isArray(expensesDictionaryResponse)) {
    return expensesDictionaryResponse
  }

  throw new Error('Invalid format for Expenses Dictionary')
}

const loadExpensesDictionary = getExpensesDictionary().catch((e) => {
  console.error(e)
  process.exit(1)
})

/** Given an Up Transaction URL, it will look up the transaction and return
 *  the matched ExpenseLookup if suitable for processing, otherwise null
 */
export async function findExpenseForTransaction (
  url: string
): Promise<Expense | null> {
  const [transaction, expensesDictionary] = await Promise.all([
    getTransaction(url),
    loadExpensesDictionary
  ])
  const amount = transaction.attributes.amount.value.replace('-', '')
  const matchedExpense = expensesDictionary.find(
    transactionMatchesExpense(transaction)
  )

  return matchedExpense !== undefined
    ? {
        amount,
        purpose: matchedExpense.expenseName
      }
    : null
}

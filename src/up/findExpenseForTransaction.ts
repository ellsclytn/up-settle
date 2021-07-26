import { Expense } from '../types/settleUp/expense'
import { getTransaction } from './api'
import { loadExpensesDictionary } from './expensesDictionary'
import { transactionMatchesExpense } from './expenseLookup'

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

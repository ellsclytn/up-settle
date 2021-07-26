import path from 'path'
import yaml from 'js-yaml'
import { ExpensesDictionary } from '../types/expensesDictionary'
import { promises as fs } from 'fs'

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

export const loadExpensesDictionary = getExpensesDictionary().catch((e) => {
  console.error(e)
  process.exit(1)
})

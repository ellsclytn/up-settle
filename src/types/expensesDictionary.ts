export interface ExpenseLookup {
  expenseName: string
  transaction: {
    reference: string
    foreignAmount?: {
      currencyCode?: string
      value?: string
    }
  }
}

export type ExpensesDictionary = ExpenseLookup[]

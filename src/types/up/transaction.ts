type TransactionStatus = 'HELD' | 'SETTLED'

interface Amount {
  currencyCode: string
  value: string
  valueInBaseUnits: number
}

interface HoldInfo {
  amount: Amount | null
  foreignAmount: Amount | null
}

export interface Transaction {
  type: 'transactions'
  id: string
  attributes: {
    status: TransactionStatus
    rawText: string
    description: string
    message: string | null
    holdInfo: HoldInfo | null
    roundUp: null
    cashback: null
    amount: Amount
    foreignAmount: Amount | null
    settledAt: string | null
    createdAt: string
  }
}

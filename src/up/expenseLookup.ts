import regexParser from 'regex-parser'
import Schema, {
  PropertyDefinition,
  SchemaDefinition,
  ValidationFunction
} from 'validate'
import { ExpenseLookup } from '../types/expensesDictionary'
import { Transaction } from '../types/up/transaction'

function parsedRegexValidator (
  dictionaryValue: string | undefined,
  required: boolean = false
): PropertyDefinition {
  const customValidator: ValidationFunction = (transactionValue) => {
    if (
      typeof dictionaryValue === 'string' &&
      typeof transactionValue === 'string'
    ) {
      return transactionValue.match(regexParser(dictionaryValue)) !== null
    } else if (required) {
      return false
    }

    return true
  }

  return {
    type: String,
    required,
    use: {
      customValidator
    }
  }
}

/** Given a Transaction, returns a function which, when called with an
 *  ExpenseLookup, returns a boolean indicating if the ExpenseLookup matches
 *  the Transaction
 */
export function transactionMatchesExpense (transaction: Transaction) {
  return (expense: ExpenseLookup) => {
    const { foreignAmount, reference } = expense.transaction

    const validationRules: SchemaDefinition = {
      attributes: {
        rawText: parsedRegexValidator(reference, true),
        foreignAmount: {
          currencyCode: parsedRegexValidator(foreignAmount?.currencyCode),
          value: parsedRegexValidator(foreignAmount?.value)
        }
      }
    }

    const schema = new Schema(validationRules)
    const errors = schema.validate(transaction)

    return errors.length === 0
  }
}

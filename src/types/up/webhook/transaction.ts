type EventType =
  | 'TRANSACTION_CREATED'
  | 'TRANSACTION_SETTLED'
  | 'TRANSACTION_DELETED'

export interface TransactionHook {
  data: {
    id: string
    type: 'webhook-events'
    attributes: {
      createdAt: string
      eventType: EventType
    }
    relationships: {
      webhook: {
        data: {
          id: string
          type: string
        }
        links: {
          related: string
        }
      }
      transaction: {
        data: {
          id: string
          type: string
        }
        links: {
          related: string
        }
      }
    }
  }
}

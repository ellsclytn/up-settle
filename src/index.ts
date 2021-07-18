import { APIGatewayProxyHandler } from 'aws-lambda'

interface Response {
  statusCode: number
  body: string
}

const respond = (payload: any, statusCode = 200): Response => ({
  statusCode,
  body: JSON.stringify(payload)
})

export const handleWebhook: APIGatewayProxyHandler = async (
  event,
  _context
) => {
  return respond({ status: 'OK', message: 'Hello, world!' })
}

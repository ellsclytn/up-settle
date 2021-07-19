# Up Settle

**A Lambda function to automatically create Settle Up expenses when criteria are met**

## Requirements

- AWS
- [Settle Up API credentials](https://settleup.io/api.html)
- [Up API Access](https://developer.up.com.au/)

## Usage

The application uses Lambda & API Gateway. For the function to run, you'll need to configure the following environment variables in the Lambda config:

- `SETTLE_UP_USERNAME`: Your Settle Up username
- `SETTLE_UP_PASSWORD`: Your Settle Up password
- `SETTLE_UP_GROUP`: The name of the Settle Up group to target
- `SETTLE_UP_USER`: The name of the Settle Up user to create expenses under
- `SETTLE_UP_AUTH_CONFIG`: JSON Object with Firebase configuration properties
- `API_TOKEN`: Up Personal Access Token

Once deployed, you'll need to generate a Webhook on the Up API. The easiest way of doing this is to simply use your preferred HTTP client and [follow the documentation](https://developer.up.com.au/#post_webhooks). You'll need to note the `secretKey` returned on Webhook creation.

After the webhook is created, a new deployment of the Lambda function is required, this time with an additional environment variable:

- `WEBHOOK_KEY`: The `secretKey` value mentioned above.

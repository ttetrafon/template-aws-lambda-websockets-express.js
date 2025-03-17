import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from '@aws-sdk/client-apigatewaymanagementapi';

const dynamoDbClient = new DynamoDBClient({});
const apiGatewayClient = new ApiGatewayManagementApiClient({
  endpoint: process.env.WEBSOCKET_API_ENDPOINT,
});

export const handler = async (event) => {
  const connectionId = event.requestContext.connectionId;
  const message = JSON.parse(event.body).message;
  const tableName = process.env.TABLE_NAME;

  // Broadcast the message to all connected clients
  const { Items } = await dynamoDbClient.send(new ScanCommand({ TableName: tableName }));
  for (const item of Items) {
    await apiGatewayClient.send(new PostToConnectionCommand({
      ConnectionId: item.connectionId.S,
      Data: JSON.stringify({ message: `You said: ${ message }` }),
    }));
  }

  return { statusCode: 200 };
};

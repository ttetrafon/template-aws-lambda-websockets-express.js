import { DynamoDBClient, DeleteItemCommand } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({});

export const handler = async (event) => {
  const connectionId = event.requestContext.connectionId;
  const tableName = process.env.TABLE_NAME;

  // Remove the connection ID from DynamoDB
  await client.send(new DeleteItemCommand({
    TableName: tableName,
    Key: {
      connectionId: { S: connectionId },
    },
  }));

  return { statusCode: 200 };
};
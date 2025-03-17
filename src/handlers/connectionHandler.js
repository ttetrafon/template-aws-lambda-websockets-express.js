import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({});

export const handler = async (event) => {
  const connectionId = event.requestContext.connectionId;
  const tableName = process.env.TABLE_NAME;

  // await client.send(new PutItemCommand({
  //   TableName: tableName,
  //   Item: {
  //     connectionId: { S: connectionId },
  //   },
  // }));

  return { statusCode: 200 };
};

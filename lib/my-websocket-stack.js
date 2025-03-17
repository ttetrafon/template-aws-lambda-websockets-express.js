import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';

export class MyWebsocketStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    // DynamoDB Table
    const table = new dynamodb.Table(this, 'MyTable', {
      tableName: 'MyTable',
      partitionKey: { name: 'connectionId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    // Lambda Functions
    const connectionHandler = new lambda.Function(this, 'ConnectionHandler', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'src/handlers/connectionHandler.handler',
      code: lambda.Code.fromAsset('src/handlers'),
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    const messageHandler = new lambda.Function(this, 'MessageHandler', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'src/handlers/messageHandler.handler',
      code: lambda.Code.fromAsset('src/handlers'),
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    const disconnectHandler = new lambda.Function(this, 'DisconnectHandler', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'src/handlers/disconnectHandler.handler',
      code: lambda.Code.fromAsset('src/handlers'),
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    // WebSocket API
    const webSocketApi = new apigwv2.WebSocketApi(this, 'MyWebSocketApi', {
      connectRouteOptions: {
        integration: new integrations.WebSocketLambdaIntegration('ConnectIntegration', connectionHandler),
      },
      disconnectRouteOptions: {
        integration: new integrations.WebSocketLambdaIntegration('DisconnectIntegration', disconnectHandler),
      },
      defaultRouteOptions: {
        integration: new integrations.WebSocketLambdaIntegration('MessageIntegration', messageHandler),
      },
    });

    // WebSocket API Stage
    const stage = new apigwv2.WebSocketStage(this, 'ProdStage', {
      webSocketApi,
      stageName: 'prod',
      autoDeploy: true,
    });

    // Output the WebSocket API URL
    new cdk.CfnOutput(this, 'WebSocketApiUrl', {
      value: stage.url,
    });
  }
}
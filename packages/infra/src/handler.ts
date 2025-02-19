
import { INestMicroservice } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
  Context,
  SQSEvent
} from 'aws-lambda';

import { AgentLambdaRequestDTOSchema } from '@sebu/dto';
import { SebuInfraModule } from './SebuInfra.module';
import { AgentForwardingService, PitchWatchdogService } from './services';
import { TxnRouterService } from './txns';
import { SQSHandler, SQSRecord } from "aws-lambda";

let app: INestMicroservice;

async function getNestApp(): Promise<INestMicroservice> {
  if (!app) {
    app = await NestFactory.createMicroservice(
      SebuInfraModule,
      {}
    );

    app.enableShutdownHooks();

    await app.init();
  }

  return app;
}

// export const defaultHttpHandler = async (
exports.defaultHttpHandler = async (
    event: APIGatewayProxyEventV2,
  context: Context,
): Promise<APIGatewayProxyResultV2> => {
  const app = await getNestApp();

  // const result = await app.getHttpAdapter().getInstance().run(event, context);
  return {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
      'Access-Control-Allow-Headers': 'Authorization',
    },

    statusCode: 200,
    body: JSON.stringify({ message: 'Hello World', event, context }),
  }

}

// export const watchdogHandler = async (): Promise<any> => {
exports.watchdogHandler = async (): Promise<any> => {
    const app = await getNestApp();
  const wdSvc = app.get(PitchWatchdogService);
  try {
    await wdSvc.run();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'OK' }),
    }
  } catch (e) {
    console.log(e);
    return {
      statusCode: 200, //do not attempt to retry event. It'll kick off again in a minute
      body: JSON.stringify({ message: e.message }),
    }
  }
}

exports.inboundTxnHandler = async (
// export const inboundTxnHandler = async (
    event: APIGatewayProxyEventV2
): Promise<any> => {
  const app = await getNestApp();
  try {
    //expected that this is coming from Tenderly or similar service with txn body with receipt/logs
    const txn = JSON.parse(event.body);
    const router = app.get(TxnRouterService);
    await router.route(txn);
    return {
      statusCode: 200,
    }
  } catch (error) {
    console.log(error);
    return {
      statusCode: 200,
    }
  }
}

// exports.handler = async (

// export const agentCallHandler: SQSHandler = async (
exports.agentCallHandler = async (
    event: SQSEvent,
  context: Context
): Promise<void> => {
  try {

    for (const r of event.Records) {
      const dto = AgentLambdaRequestDTOSchema.parse(JSON.parse(r.body));
      const app = await getNestApp();

      const sentTimestamp = parseInt(r.attributes.SentTimestamp, 10);
      const age = Date.now() - sentTimestamp;

      console.log(`******** Agent Call Handler : START : age: ${age}ms ********`);
      const startTime = Date.now();
      const agentCallerService = app.get(AgentForwardingService);
      await agentCallerService.callAgent(dto);
      const endTime = Date.now();
      console.log(`******** Agent Call Handler : END : elapsed: ${endTime - startTime}ms ********`);
    }

  } catch (error) {
    console.log(error);
    throw error;
  }
}
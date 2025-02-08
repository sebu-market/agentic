import { NestFactory } from '@nestjs/core';
import serverlessExpress from '@codegenie/serverless-express';
import { Callback, Context, Handler } from 'aws-lambda';
import { SebuInfraModule } from './SebuInfra.module';

let server: Handler;


const allowedDomains = [
  'https://sebu.market',
  'https://www.sebu.market',
  'https://dev.sebu.market',
];

// A regex to match any localhost with any port: e.g., http://localhost:3000
const localhostRegex = /^http:\/\/localhost:\d+$/;

async function bootstrap(): Promise<Handler> {
  const app = await NestFactory.create(SebuInfraModule);

  //   'Content-Type': 'application/json',
  //   'Access-Control-Allow-Origin': '*',
  //   'Access-Control-Allow-Credentials': true,
  //   'Access-Control-Allow-Headers': 'Authorization',
  app.enableCors({
    origin: (origin, callback) => {
      // If there's no origin (e.g. mobile apps, curl requests, or same-server requests),
      // you might want to allow or block them explicitly here.
      if (!origin) {
        // Allow requests without origin, or explicitly handle them:
        return callback(null, true);
      }

      // Check if the origin is in your allowedDomains array
      // OR it matches the localhostRegex
      if (allowedDomains.includes(origin) || localhostRegex.test(origin)) {
        callback(null, origin);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Authorization,Content-Type',
  });

  await app.init();
  await app.listen(process.env.PORT ?? 3000);
  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

exports.handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  server = server ?? (await bootstrap());
  return server(event, context, callback);
};

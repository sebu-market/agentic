import { NestFactory } from '@nestjs/core';
import serverlessExpress from '@codegenie/serverless-express';
import { Callback, Context, Handler } from 'aws-lambda';
import { SebuModule } from 'src/sebu.module';

let server: Handler;

const allowedDomains = [
  'https://sebu.market',
  'https://www.sebu.market',
  'https://dev.sebu.market',
];

// match any localhost with any port: e.g., http://localhost:3000
const localhostRegex = /^http:\/\/localhost:\d+$/;

async function bootstrap(): Promise<Handler> {
  const app = await NestFactory.create(SebuModule);

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

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

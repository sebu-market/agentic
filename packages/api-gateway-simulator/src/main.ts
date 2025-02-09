import { NestFactory } from '@nestjs/core';
import { AppModule } from './AppModule';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: process.env.NODE_ENV === 'development' ? ['log', 'debug', 'error', 'verbose', 'warn'] : ['error', 'warn'],
  });

  const port = process.env.PORT ?? 3000;

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    // exposedHeaders
    optionsSuccessStatus: 200,
    allowedHeaders: 'Content-Type,Authorization,Cookie',
  });
  await app.init();
  app.enableShutdownHooks();
  await app.listen(port);
  console.log("App is ready and running on port", port);
}
bootstrap();


import { INestMicroservice } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// const originalExit = process.exit;

// (process as any).exit = (...args) => {
//   console.trace('process.exit called');
//   originalExit(...args);
// };

// process.on('uncaughtException', (err) => {
//   console.error('Unhandled exception:', err);
//   console.trace('Stack trace:');
// });

// process.on('unhandledRejection', (reason) => {
//   console.error('Unhandled rejection:', reason);
//   console.trace('Stack trace:');
// });


let app: INestMicroservice;

export async function getNestApp(): Promise<INestMicroservice> {
  if (!app) {
    app = await NestFactory.createMicroservice(
      AppModule,
      {
        // important to allow proper error handling in the Lambda environment
        abortOnError: false,
      }
    );

    app.enableShutdownHooks();

    await app.init();

    // FIXME: clear out cached instance on shutdown
  }

  return app;
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  let logLevel = process.env.LOG_LEVEL || 'error'
  const appConfig: any = {
    logger: logLevel.split(',')
  }
  const app = await NestFactory.create(AppModule, appConfig);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Job Offers API')
    .setDescription('API for fetching and managing job offers')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
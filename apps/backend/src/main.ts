import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import { SessionService } from './session/session.service';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Get the session service
  const sessionService = app.get(SessionService);
  
  // Security middleware
  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());
  app.use(sessionService.getSessionMiddleware());
  
  // Enable CORS with secure configuration
  const origin = process.env.FRONTEND_URL || 'http://localhost:3000';
    console.log(origin)
  app.enableCors({
    origin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  });
  
  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  
  // Global prefix for API routes
  app.setGlobalPrefix('api');
  
  // Setup Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Fullstack Boilerplate API')
    .setDescription('The API documentation for the Fullstack Boilerplate project')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('tasks', 'Task management endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addCookieAuth('connect.sid', {
      type: 'apiKey',
      in: 'Cookie',
      name: 'connect.sid',
    })
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
  
  // Start the server
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/api`);
  console.log(`API documentation available at: http://localhost:${port}/api/docs`);
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

bootstrap();

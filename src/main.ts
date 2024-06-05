import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  //配置cookie中间件
  app.use(cookieParser('password'));

  //配置session中间件 
  app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 60000,
      secure: true,
      httpOnly: true
    },
    rolling: true
  }));

  app.useStaticAssets('public');
  app.setBaseViewsDir('views');
  app.setViewEngine('ejs');

  const config = new DocumentBuilder()
    .setTitle('Cats example')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('cats')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  
  // 此处的api为访问路径，即http://localhost:3000/api
  SwaggerModule.setup('api', app, document);


  await app.listen(3000);
}
bootstrap();

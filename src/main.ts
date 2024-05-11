import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';


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

  await app.listen(3000);
}
bootstrap();

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './module/user/user.module';
import { ApiModule } from './module/api/api.module';
import { DatatransService } from './service/datatrans/datatrans.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SqlModule } from './module/sql/sql.module';
import * as dotenv from 'dotenv';
dotenv.config();

@Module({
  imports: [UserModule, ApiModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT),
      username: process.env.MYSQL_USERNAME,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      retryDelay: 500,
      retryAttempts: 10,
      synchronize: true,
      autoLoadEntities: true,
    }),
    SqlModule,
  ],
  controllers: [AppController],
  providers: [AppService, DatatransService],
  exports: [DatatransService],
})
export class AppModule {}

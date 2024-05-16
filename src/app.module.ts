import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './module/user/user.module';
import { ApiModule } from './module/api/api.module';
import { DatatransService } from './service/datatrans/datatrans.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SqlModule } from './module/sql/sql.module';

@Module({
  imports: [UserModule, ApiModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'rm-cn-o493neqr4000ml0o.rwlb.rds.aliyuncs.com',
      port: 3306,
      username: 'root',
      password: 'Heyi3131',
      database: 'draweverything',
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

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './module/user/user.module';
import { ApiModule } from './module/api/api.module';
import { DatatransService } from './service/datatrans/datatrans.service';
import { SqlService } from './service/sql/sql.service';

@Module({
  imports: [UserModule, ApiModule],
  controllers: [AppController],
  providers: [AppService, DatatransService, SqlService],
})
export class AppModule {}

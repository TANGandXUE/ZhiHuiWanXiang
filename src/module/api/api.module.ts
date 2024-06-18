import { Module } from '@nestjs/common';
import { ApiController } from './controller/api/api.controller';
import { UploadService } from './service/upload/upload.service';
import { IsimgService } from './service/isimg/isimg.service';
import { DatatransService } from 'src/service/datatrans/datatrans.service';
import { MeituautoService } from './service/meituauto/meituauto.service';
import { ChatqwenService } from './service/chatqwen/chatqwen.service';
import { AlimsgService } from './service/alimsg/alimsg.service';
import { SqlModule } from '../sql/sql.module';
import { PayController } from './controller/pay/pay.controller';
import { PayService } from './service/pay/pay.service';
import { Pay } from 'src/entities/pay.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [SqlModule,TypeOrmModule.forFeature([Pay])],
  controllers: [ApiController, PayController],
  providers: [UploadService, IsimgService, DatatransService, MeituautoService, ChatqwenService, AlimsgService, PayService],
  exports: [UploadService, ChatqwenService, MeituautoService, AlimsgService],
})
export class ApiModule {}

import { Module } from '@nestjs/common';
import { ApiController } from './controller/api/api.controller';
import { UploadService } from './service/upload/upload.service';
import { IsimgService } from './service/isimg/isimg.service';
import { DatatransService } from 'src/service/datatrans/datatrans.service';
import { MeituautoService } from './service/meituauto/meituauto.service';
import { ChatqwenService } from './service/chatqwen/chatqwen.service';

@Module({
  imports: [],
  controllers: [ApiController],
  providers: [UploadService, IsimgService, DatatransService, MeituautoService, ChatqwenService],
  exports: [UploadService, ChatqwenService, MeituautoService],
})
export class ApiModule {}

import { Module } from '@nestjs/common';
import { ApiController } from './controller/api/api.controller';
import { UploadService } from './service/upload/upload.service';
import { IsimgService } from './service/isimg/isimg.service';
import { DatatransService } from 'src/service/datatrans/datatrans.service';

@Module({
  imports: [],
  controllers: [ApiController],
  providers: [UploadService, IsimgService, DatatransService],
  exports: [UploadService],
})
export class ApiModule {}

import { Module } from '@nestjs/common';
import { ApiController } from './controller/api/api.controller';
import { UploadService } from './service/upload/upload.service';
import { IsimgService } from './service/isimg/isimg.service';

@Module({
  controllers: [ApiController],
  providers: [UploadService, IsimgService]
})
export class ApiModule {}

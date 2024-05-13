import { Module } from '@nestjs/common';
import { UploadController } from './controller/upload/upload.controller';
import { DownloadController } from './controller/download/download.controller';
import { UploadService } from './service/upload/upload.service';

@Module({
  controllers: [UploadController, DownloadController],
  providers: [UploadService]
})
export class UserModule {}

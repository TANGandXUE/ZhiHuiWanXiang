import { Module } from '@nestjs/common';
import { UploadController } from './controller/upload/upload.controller';
import { DownloadController } from './controller/download/download.controller';
import { UploadService } from './service/upload/upload.service';
import { SqlModule } from '../../module/sql/sql.module';

@Module({
  imports: [SqlModule],
  controllers: [UploadController, DownloadController],
  providers: [UploadService]
})
export class UserModule {}

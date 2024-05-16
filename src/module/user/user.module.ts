import { Module } from '@nestjs/common';
import { UploadController } from './controller/upload/upload.controller';
import { DownloadController } from './controller/download/download.controller';
import { UploadService } from './service/upload/upload.service';
import { SqlModule } from '../../module/sql/sql.module';
import { ApiModule } from '../api/api.module';
import { DatatransService } from 'src/service/datatrans/datatrans.service';


@Module({
  imports: [SqlModule, ApiModule],
  controllers: [UploadController, DownloadController],
  providers: [UploadService, DatatransService]
})
export class UserModule {}

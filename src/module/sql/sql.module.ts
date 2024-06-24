import { Module } from '@nestjs/common';
import { SqlService } from './service/sql/sql.service';
import { UserUpload } from '../../entities/userupload.entity';
import { UserInfo } from 'src/entities/userinfo.entity';
import { Pay } from 'src/entities/pay.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OssService } from './service/oss/oss.service';
import { TestController } from './controller/test/test.controller';
import { DatatransService } from 'src/service/datatrans/datatrans.service';
import { JwtService } from '@nestjs/jwt';
import { OssController } from './controller/oss/oss.controller';


@Module({
    imports: [
        TypeOrmModule.forFeature([UserUpload, UserInfo, Pay])
    ],
    providers: [SqlService, OssService, DatatransService, JwtService],
    exports: [SqlService, OssService],
    controllers: [TestController, OssController]

})
export class SqlModule {

}

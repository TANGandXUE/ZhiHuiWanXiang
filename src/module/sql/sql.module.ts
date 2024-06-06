import { Module } from '@nestjs/common';
import { SqlService } from './service/sql/sql.service';
import { UserUpload } from '../../entities/userupload.entity';
import { UserInfo } from 'src/entities/userinfo.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OssService } from './service/oss/oss.service';
import { TestController } from './controller/test/test.controller';
import { DatatransService } from 'src/service/datatrans/datatrans.service';
import { JwtService } from '@nestjs/jwt';


@Module({
    imports: [
        TypeOrmModule.forFeature([UserUpload, UserInfo])
    ],
    providers: [SqlService, OssService, DatatransService, JwtService],
    exports: [SqlService, OssService],
    controllers: [TestController]

})
export class SqlModule {

}

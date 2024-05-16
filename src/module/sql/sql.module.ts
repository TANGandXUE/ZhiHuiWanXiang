import { Module } from '@nestjs/common';
import { SqlService } from './service/sql/sql.service';
import { UserUpload } from '../../entities/userupload.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OssService } from './service/oss/oss.service';
import { TestController } from './controller/test/test.controller';


@Module({
    imports: [TypeOrmModule.forFeature([UserUpload])],
    providers: [SqlService, OssService],
    exports: [SqlService, OssService],
    controllers: [TestController]

})
export class SqlModule {

}

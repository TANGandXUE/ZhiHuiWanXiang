import { Module } from '@nestjs/common';
import { SqlService } from './service/sql/sql.service';
import { UserUpload } from '../../entities/userupload.entity';
import { TypeOrmModule } from '@nestjs/typeorm';


@Module({
    imports: [TypeOrmModule.forFeature([UserUpload])],
    providers: [SqlService],
    exports: [SqlService]

})
export class SqlModule {

}

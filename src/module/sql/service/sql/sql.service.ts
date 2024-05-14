import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getMetadataArgsStorage } from 'typeorm';
import { UserUpload } from 'src/entities/userupload.entity';

@Injectable()
export class SqlService {

    constructor(
        @InjectRepository(UserUpload)
        private readonly userUploadRepository: Repository<UserUpload>,
    ) { }

    addFile(fileInfos: Array<{ fileName: string, filePath: string }>){

        for (const fileInfo of fileInfos){
            const userUpload = new UserUpload();
            userUpload.uploadDate = new Date();
            userUpload.fileName = fileInfo.fileName;
            userUpload.filePath = fileInfo.filePath;
            // userUpload.userId = userId 后期需要改成传入userID
            userUpload.userId = 0;
            this.userUploadRepository.save(userUpload);

            const columns = getMetadataArgsStorage().columns.filter(c => c.target === UserUpload);

            console.log("UserUpload中的Columns:");
            columns.forEach(c => {
                console.log(c.propertyName);
            });
        }

        

    }

}

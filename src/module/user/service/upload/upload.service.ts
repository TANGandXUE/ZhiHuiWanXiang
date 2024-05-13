import { Body, Injectable, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { createWriteStream } from 'fs';
import { join } from 'path';

@Injectable()
export class UploadService {

    //写入文件，应修改到SQL中
    writeFiles(files){
        for (const file of files) {
            var writeStream = createWriteStream(join(__dirname, '../../../../../public/user/upload', `${Date.now()}-${file.originalname}`))
            writeStream.write(file.buffer);
        }
    }
}

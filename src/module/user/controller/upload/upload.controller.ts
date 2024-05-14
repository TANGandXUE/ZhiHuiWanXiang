import { Body, Controller, Get, Post, Render, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { UploadService } from '../../service/upload/upload.service';
import { SqlService } from '../../../sql/service/sql/sql.service';

@Controller('/user/upload')
export class UploadController {
    constructor(private uploadService: UploadService, private sqlService: SqlService) { }

    @Get()
    @Render('user/upload')
    upload(@Body() body, @UploadedFiles() files) {
        console.log('测试');
    }
    
    @Post('uploadfiles')
    @UseInterceptors(FilesInterceptor('pic'))
    uploadFiles(@Body() body, @UploadedFiles() files) {

        //写入文件，返回文件信息
        var fileInfo = this.uploadService.writeFiles(files);

        //写入数据库
        this.sqlService.addFile(fileInfo)

        // res.redirect('/user');

        return '上传成功';
    }

}

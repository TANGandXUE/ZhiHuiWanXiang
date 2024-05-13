import { Body, Controller, Get, Post, Render, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { UploadService } from '../../service/upload/upload.service';

@Controller('/user/upload')
export class UploadController {
    constructor(private uploadService: UploadService) { }

    @Get()
    @Render('user/upload')
    upload(@Body() body, @UploadedFiles() files) {
        console.log('测试');
    }
    
    @Post('uploadfiles')
    @UseInterceptors(FilesInterceptor('pic'))
    uploadFiles(@Body() body, @UploadedFiles() files) {

        this.uploadService.writeFiles(files);


        // res.redirect('/user');

        return '上传成功';
    }

}

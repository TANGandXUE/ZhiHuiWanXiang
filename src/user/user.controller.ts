import { Body, Controller, Get, Post, Render, UploadedFile, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
// import { TestService } from 'src/test/test.service';

import { createWriteStream } from 'fs'

import { join } from 'path'

@Controller('user')
export class UserController {

    // constructor(private readonly testService: TestService) { }

    @Get()
    @Render('admin/useruploadmany')
    index() {
    }

    // @Get('test')
    // test() {
    //     return this.testService.findAll();
    // }

    @Post('upload')
    @UseInterceptors(FileInterceptor('pic'))
    upload(@Body() body, @UploadedFile() file) {
        console.log(body);
        console.log(file);


        var writeStream = createWriteStream(join(__dirname, '../../public/upload', `${Date.now()}-${file.originalname}`))

        writeStream.write(file.buffer);


        // res.redirect('/user');

        return '上传成功';
    }

    @Post('uploadmany')
    @UseInterceptors(FilesInterceptor('pic'))
    uploadmany(@Body() body, @UploadedFiles() files) {
        console.log(body);
        console.log(files);

        for (const file of files) {
            var writeStream = createWriteStream(join(__dirname, '../../public/upload', `${Date.now()}-${file.originalname}`))
            writeStream.write(file.buffer);
        }


        // res.redirect('/user');

        return '上传成功';
    }


}

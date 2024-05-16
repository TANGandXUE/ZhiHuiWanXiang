import { Body, Controller, Get, Post, Render, Req, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from '../../service/upload/upload.service';
import { SqlService } from '../../../sql/service/sql/sql.service';
// import { UploadService as ApiUploadService } from 'src/module/api/service/upload/upload.service';
// import { DatatransService } from 'src/service/datatrans/datatrans.service';
import { OssService } from 'src/module/sql/service/oss/oss.service';

@Controller('/user/upload')
export class UploadController {
    constructor(
        private uploadService: UploadService,
        private sqlService: SqlService,
        // private apiUploadService: ApiUploadService,
        // private datatransService: DatatransService,
        private ossService: OssService
    ) { }

    @Get()
    @Render('user/upload')
    upload(@Body() body, @UploadedFiles() files) {
        console.log('测试');
    }
    
    @Post('uploadfiles')
    @UseInterceptors(FilesInterceptor('pic'))
    async uploadFiles(@Body() body, @UploadedFiles() files, @Req() req) {

        // //构造一个filterParams对象
        // const filterParams = {
        //     filterType: req.body.filterType,
        //     filterAlpha: Number(req.body.filterAlpha),
        //     beautyAlpha: Number(req.body.beautyAlpha),
        //     rsp_media_type: 'base64'
        // };

        // console.log('1');

        //写入文件，返回异步文件信息
        let fileInfos = await this.uploadService.writeFiles(files);

        // console.log('2');

        //写入数据库
        this.sqlService.uploadFiles(fileInfos);

        let NoRenameFileInfos = await this.ossService.reNameFileInfos(fileInfos);

        //写入OSS
        this.ossService.uploadFiles( NoRenameFileInfos );

        // //将fileInfo单独取出，并转化成linux路径格式
        // let filePathList: string[] = this.datatransService.convertWindowsSlashes(fileInfos.map(item => item.filePath));

        // console.log(filePathList);


        // //调用美图API
        // try{

        //     const result = await this.apiUploadService.meitu_filter('9762db76d31a4f89a415c1ea8556c988','a7aba72070bb4861934502e9e50637b6',filePathList, filterParams)

        //     console.log(result);

        //     if (result.data.media_info_list.length > 0) {
        //         console.log('media_info_list中有数据');
        //     } else {
        //         console.log('media_info_list中没有数据');
        //     }

        // }catch(err){
        //     console.log(err)
        //     console.log('上传失败')
        // }
        
        // console.log(filePathList);

        // res.redirect('/user');

        return '上传成功';
    }

}

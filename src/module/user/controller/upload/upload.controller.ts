import { Body, Controller, Get, Post, Render, Req, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from '../../service/upload/upload.service';
import { SqlService } from '../../../sql/service/sql/sql.service';
import { UploadService as ApiUploadService } from 'src/module/api/service/upload/upload.service';
import { OssService } from 'src/module/sql/service/oss/oss.service';
import { DatatransService } from 'src/service/datatrans/datatrans.service';
// import { Params } from '@alicloud/openapi-client';
import { ChatqwenService } from 'src/module/api/service/chatqwen/chatqwen.service';
import { MeituautoService } from 'src/module/api/service/meituauto/meituauto.service';


@Controller('/user/upload')
export class UploadController {
    constructor(
        private uploadService: UploadService,
        private sqlService: SqlService,
        private apiUploadService: ApiUploadService,
        private datatransService: DatatransService,
        private ossService: OssService,
        private chatqwenService: ChatqwenService,
        private meituautoService: MeituautoService
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

        // fileInfos_url: fileName, fileURL

        // //写入数据库
        // this.sqlService.uploadFiles(fileInfos);

        //给重命名文件加后缀，防止覆盖上传
        let NoRenameFileInfos = await this.ossService.reNameFileInfos(fileInfos);

        //写入OSS
        let fileInfos_url = await this.ossService.uploadFiles(NoRenameFileInfos);

        let fileInfos_jpg_url = await this.datatransService.img2img(fileInfos_url,
            {
                outputFormat: 'jpg',
                quality: 100,
            }
        )

        console.log('此处的results_url: ', fileInfos_jpg_url);


        // 调用qwen处理自然语言成meituauto参数
        const responseParams = await this.chatqwenService.txt2param(req.body.inputText, "meituauto");

        // 调用MeituAuto
        await this.meituautoService.meitu_auto(fileInfos_jpg_url, responseParams,
            (results_url) => {
                console.log('meituauto执行结束: ', results_url);
            }
        )



        // // 当results_url有值后执行这里的代码
        // let resultFileInfos = await this.apiUploadService.ali_imageEnhan(
        //     await this.ossService.uploadFiles(
        //         await this.datatransService.urlToLocal(results_url, 'jpg')
        //     ),'jpg'
        // );
        // console.log('resultFileInfos: ', resultFileInfos);

        return '上传成功';




        // async function processWhenUrlReady() {
        //     while (!results_url) {
        //         await new Promise(resolve => setTimeout(resolve, 5000)); // 等待5秒
        //     }

        //     console.log('processWhenUrlReady内部的results_url: ', results_url);

        //     // 当results_url有值后执行这里的代码
        //     let resultFileInfos = await this.apiUploadService.ali_imageEnhan(
        //         await this.datatransService.urlToLocal(results_url, 'jpg'),
        //         'jpg'
        //     );
        //     console.log('resultFileInfos: ', resultFileInfos);

        //     return '上传成功';
        // }

        // // 调用此函数开始等待并处理
        // processWhenUrlReady();

        // //调用阿里云图像增强API
        // let resultFileInfos = await this.apiUploadService.ali_imageEnhan(await this.datatransService.urlToLocal(results_url, 'jpg'),'jpg');

        // console.log('resultFileInfos: ', resultFileInfos);

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


    }

}

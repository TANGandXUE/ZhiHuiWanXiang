import { Controller, Get } from '@nestjs/common';
import { OssService } from '../../service/oss/oss.service';
import { DatatransService } from 'src/service/datatrans/datatrans.service';

@Controller('sql/test')
export class TestController {
    constructor(
        private readonly ossService: OssService,
        private readonly datatransService: DatatransService
    ) { }

    @Get('oss-upload')
    async ossUploadTest() {

        const fileInfos = [
            {
                fileName: 'test1',
                filePath: 'C:/Users/Administrator/Desktop/temp/new.jpg'
            },
            {
                fileName: 'test2',
                filePath: 'C:/Users/Administrator/Desktop/temp/new2.jpg'
            }
        ];

        await this.ossService.uploadFiles(fileInfos);
    }

    @Get('oss-download')
    async ossDownloadTest() {

        const fileInfos = [
            {
                fileName: 'test1',
                filePath: ''
            },
            {
                fileName: 'test2',
                filePath: ''
            }
        ];

        const downloadFileInfos = await this.ossService.downloadFiles(fileInfos);

        console.log(downloadFileInfos);
    }

    @Get('url2path')
    async url2path() {
        console.log( await this.datatransService.urlToLocal(
            [
                {
                    fileName: 'test2',
                    fileURL: 'http://vibktprfx-prod-prod-damo-eas-cn-shanghai.oss-cn-shanghai.aliyuncs.com/enhance-img-color/2024-05-18/d6535ea5-cf50-40da-b5f2-3f5102dc6f4f/20240518_233007729457_dncfsirjt4.jpg?Expires=1716048007&OSSAccessKeyId=LTAI4FoLmvQ9urWXgSRpDvh1&Signature=U4m%2B%2Bgzl6Fm5jFqY1Au7ZZqx%2Bmc%3D'
                }
            ],
            "jpg"
        ))
    }

}

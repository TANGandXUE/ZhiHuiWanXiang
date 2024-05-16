import { Controller, Get } from '@nestjs/common';
import { OssService } from '../../service/oss/oss.service';

@Controller('sql/test')
export class TestController {
    constructor(private readonly ossService: OssService) { }

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

    // @Get('oss-fileExist')

}

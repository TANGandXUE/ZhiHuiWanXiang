import { Controller, Post, Req, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { SqlService } from 'src/module/sql/service/sql/sql.service';
import { JwtAuthGuard } from '../../others/jwt-auth.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { OssService } from 'src/module/sql/service/oss/oss.service';
import { UploadService } from '../../service/upload/upload.service';
import { response } from 'express';

@Controller('settings')
export class SettingsController {
    constructor(
        private sqlService: SqlService,
        private ossService: OssService,
        private uploadService: UploadService,
    ) { }

    @Post('updateinfo')
    @UseGuards(JwtAuthGuard)
    async updateInfo(@Req() req) {

        // 解析request
        const userPhone = req.body.userPhone;
        const userEmail = req.body.userEmail;
        const updateInfo = req.body.updateInfo;
        const updateType = req.body.updateType;

        // 根据手机号或邮箱重设密码
        return await this.sqlService.updateUserInfo(userPhone, userEmail, updateInfo, updateType);

    }

    // 写一个用户更新头像的Post，记得可能需要处理图像文件格式的解析
    @Post('updateavatar')
    @UseInterceptors(FilesInterceptor('file'))
    async updateAvatar(@UploadedFiles() files, @Req() req) {

        try {
            // 写入文件并重命名重名文件
            const fileInfos = await this.ossService.reNameFileInfos(
                await this.uploadService.writeFiles(files)
            )
            // 写入OSS
            const fileInfos_url = await this.ossService.uploadFiles(fileInfos);
            console.log('fileInfos_url: ', fileInfos_url);
            console.log('phone: ', req.body.userPhone);
            console.log('email: ', req.body.userEmail);
            // 写入数据库中对应的用户
            const responseData = await this.sqlService.updateUserInfo(req.body.userPhone, req.body.userEmail, fileInfos_url[0].fileURL, 'userAvatarUrl');
            console.log('这里执行到了');
            console.log('responseData: ', responseData);
            if (responseData.isSuccess)
                return { isSuccess: true, message: '上传头像成功', data: fileInfos_url[0] }
            else
                return { isSuccess: false, message: '头像写入数据库失败' }
        }
        catch (e) {
            console.log(e)
            return { isSuccess: false, message: '上传头像失败' }
        }

    }
}

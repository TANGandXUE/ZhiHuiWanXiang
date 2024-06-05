import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserUpload } from 'src/entities/userupload.entity';
import { UserInfo } from 'src/entities/userinfo.entity';

@Injectable()
export class SqlService {

    constructor(
        @InjectRepository(UserUpload)
        private readonly userUploadRepository: Repository<UserUpload>,
        @InjectRepository(UserInfo)
        private readonly userInfoRepository: Repository<UserInfo>
    ) { }

    uploadFiles(fileInfos: Array<{ fileName: string, filePath: string }>) {

        for (const fileInfo of fileInfos) {
            const userUpload = new UserUpload();
            userUpload.uploadDate = new Date();
            userUpload.fileName = fileInfo.fileName;
            userUpload.filePath = fileInfo.filePath;
            // userUpload.userId = userId 后期需要改成传入userID
            userUpload.userId = 0;
            this.userUploadRepository.save(userUpload);

            // const columns = getMetadataArgsStorage().columns.filter(c => c.target === UserUpload);

            // console.log("UserUpload中的Columns:");
            // columns.forEach(c => {
            //     console.log(c.propertyName);
            // });
        }
    }

    // 用户注册
    register(
        registerInfos: {
            userName: string,
            userPassword: string,
            userPhone: string,
            userEmail: string,
        }
    ) {
        const userInfo = new UserInfo();

        // 使用传入值或初始值为数据库初始化赋值
        // 传入值
        userInfo.userName = registerInfos.userName;
        userInfo.userPassword = registerInfos.userPassword;
        userInfo.userPhone = registerInfos.userPhone;
        userInfo.userEmail = registerInfos.userEmail;
        // 初始值
        userInfo.userAvatarUrl = "https://clouddreamai.oss-cn-shanghai.aliyuncs.com/userLogo.jpg";
        userInfo.userLevel = 0;
        userInfo.userPoints = 0;
        userInfo.userRegisterDate = new Date();
        userInfo.userStatus = 'normal';
        userInfo.userUsedPoints = 0;
        userInfo.userExpireDate = undefined;

        this.userInfoRepository.save(userInfo);
        console.log("注册成功: ", userInfo);
    }
// 查找用户信息是否存在
async elementExist(fieldName: keyof UserInfo, value: any) {
    // 根据提供的字段名和值查询用户信息
    return await this.userInfoRepository.findOne({ where: { [fieldName]: value } });
}

}

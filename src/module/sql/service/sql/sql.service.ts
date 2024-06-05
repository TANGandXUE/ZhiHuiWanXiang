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
    async elementExist(fieldName: any, value: any) {
        // 根据提供的字段名和值查询用户信息
        return await this.userInfoRepository.findOne({ where: { [fieldName]: value } });
    }

    // 用户登录
    async login(loginInfos: { userNameOrPhoneOrEmail: string, userPassword: string }) {
        // 正则表达式用于匹配邮箱和手机号
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phonePattern = /^1[3-9]\d{9}$/;

        let identifierType: string;
        let user: UserInfo | null = null;

        // 判断输入类型
        if (emailPattern.test(loginInfos.userNameOrPhoneOrEmail)) {
            identifierType = 'userEmail';
        } else if (phonePattern.test(loginInfos.userNameOrPhoneOrEmail)) {
            identifierType = 'userPhone';
        } else {
            // 假设剩下的情况是用户名
            identifierType = 'userName';
        }

        // 查询用户
        user = await this.elementExist(identifierType, loginInfos.userNameOrPhoneOrEmail);

        // 处理查询结果
        if (user) {
            // 验证密码
            if (user.userPassword === loginInfos.userPassword) {
                console.log("登录成功，欢迎回来，", user.userName);
            } else {
                console.log("密码错误，请重新输入");
            }
        } else {
            // 根据输入类型给出对应的提示
            switch (identifierType) {
                case 'userName':
                    console.log("用户名不存在，请检查输入");
                    break;
                case 'userPhone':
                    console.log("手机号未注册，请先注册");
                    break;
                case 'userEmail':
                    console.log("邮箱未注册，请先注册");
                    break;
                default:
                    console.log("输入不合法，请输入用户名、手机号或邮箱");
                    break;
            }
        }
    }
}


import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserUpload } from 'src/entities/userupload.entity';
import { UserInfo } from 'src/entities/userinfo.entity';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from 'src/module/user/others/jwtconstants';
import * as dotenv from 'dotenv';
dotenv.config();

const initUserAvatarUrl = process.env.INIT_USER_AVATAR_URL || 'https://clouddreamai.com/userLogo.jpg'
const initUserPoints = Number(process.env.INIT_USER_POINTS || '100');
const minPointsAfterDeduct = Number(process.env.MIN_POINTS_AFTER_DEDUCT || '0');

@Injectable()
export class SqlService {

    constructor(
        @InjectRepository(UserUpload)
        private readonly userUploadRepository: Repository<UserUpload>,
        @InjectRepository(UserInfo)
        private readonly userInfoRepository: Repository<UserInfo>,
        private jwtService: JwtService,
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
        userInfo.userAvatarUrl = initUserAvatarUrl;
        userInfo.userLevel = 0;
        userInfo.userPoints = initUserPoints;
        userInfo.userRegisterDate = new Date();
        userInfo.userStatus = 'normal';
        userInfo.userUsedPoints = 0;
        userInfo.userExpireDate = undefined;

        this.userInfoRepository.save(userInfo);
        console.log("注册成功: ", userInfo);
        return { isRegister: true, message: '注册成功' };
    }
    // 查找用户信息是否存在
    async elementExist(fieldName: any, value: any) {
        // 根据提供的字段名和值查询用户信息
        return await this.userInfoRepository.findOne({ where: { [fieldName]: value } });
    }

    // 更新用户信息
    async updateUserInfo(userPhone: string, userEmail: string, updateInfo: string, updateType: string) {

        let userToUpdate: any = {};

        if (userPhone !== '')
            userToUpdate = await this.userInfoRepository.findOne({ where: { userPhone } });
        else if (userEmail !== '')
            userToUpdate = await this.userInfoRepository.findOne({ where: { userEmail } });
        else
            return { isSuccess: false, message: '手机号和邮箱均为空' };

        // 检查用户是否存在
        if (!userToUpdate) {
            console.log("用户不存在");
            return { isSuccess: false, message: '用户不存在' };
        }

        // 判断更新的信息是否是不能与数据库中数据重复的类型，比如手机号不能重复等
        if (updateType === "userName") {
            if (await this.elementExist(updateType, updateInfo))
                return { isSuccess: false, message: '用户名已存在' };
        } else if (updateType === "userPhone") {
            if (await this.elementExist(updateType, updateInfo))
                return { isSuccess: false, message: '手机号已存在' };
        } else if (updateType === "userEmail") {
            if (await this.elementExist(updateType, updateInfo))
                return { isSuccess: false, message: '邮箱已存在' };
        }

        // 更新信息
        userToUpdate[updateType] = updateInfo;

        // 保存更新后的用户信息到数据库
        await this.userInfoRepository.save(userToUpdate);
        console.log("用户信息更新成功: ", userToUpdate);
        return { isSuccess: true, message: '用户信息更新成功' };
    }

    // 获取点数
    async getPoints(userPhone: string, userEmail: string) {
        let userToGet: any = {};

        if (userPhone !== '')
            userToGet = await this.userInfoRepository.findOne({ where: { userPhone } });
        else if (userEmail !== '')
            userToGet = await this.userInfoRepository.findOne({ where: { userEmail } });
        else
            return { isSuccess: false, message: '手机号和邮箱均为空' };

        // 检查用户是否存在
        if (!userToGet) {
            console.log("用户不存在");
            return { isSuccess: false, message: '用户不存在' };
        } else {
            return { isSuccess: true, message: '获取点数成功', data: userToGet.userPoints };
        }
    }

    // 获取所有用户信息
    async getUserInfos(userPhone: string, userEmail: string) {
        let userToGet: any = {};

        if (userPhone !== '')
            userToGet = await this.userInfoRepository.findOne({ where: { userPhone } });
        else if (userEmail !== '')
            userToGet = await this.userInfoRepository.findOne({ where: { userEmail } });
        else
            return { isSuccess: false, message: '手机号和邮箱均为空' };

        // 检查用户是否存在
        if (!userToGet) {
            console.log("用户不存在");
            return { isSuccess: false, message: '用户不存在' };
        } else {
            return { isSuccess: true, message: '获取用户信息成功', data: userToGet };
        }
    }

    // 判断点数够不够
    async isPointsEnough(userPhone: string, userEmail: string, pointsToDeduct: number) {
        let userToGet: any = {};

        if (userPhone !== '')
            userToGet = await this.userInfoRepository.findOne({ where: { userPhone } });
        else if (userEmail !== '')
            userToGet = await this.userInfoRepository.findOne({ where: { userEmail } });
        else
            return { isSuccess: false, message: '手机号和邮箱均为空' };

        // 检查用户是否存在
        if (!userToGet) {
            console.log("用户不存在");
            return { isSuccess: false, message: '用户不存在' };
        }

        if (userToGet.userPoints - pointsToDeduct < minPointsAfterDeduct)
            return { isSuccess: false, message: '点数不足', data: userToGet.userPoints }
        else
            return { isSuccess: true, message: '点数充足', data: userToGet.userPoints };

    }

    // 扣除点数
    async deductPoints(userPhone: string, userEmail: string, pointsToDeduct: number) {
        let userToUpdate: any = {};

        if (userPhone !== '')
            userToUpdate = await this.userInfoRepository.findOne({ where: { userPhone } });
        else if (userEmail !== '')
            userToUpdate = await this.userInfoRepository.findOne({ where: { userEmail } });
        else
            return { isSuccess: false, message: '手机号和邮箱均为空' };

        // 检查用户是否存在
        if (!userToUpdate) {
            console.log("用户不存在");
            return { isSuccess: false, message: '用户不存在' };
        }

        // 扣除点数
        if (userToUpdate.userPoints - pointsToDeduct >= minPointsAfterDeduct) {
            userToUpdate.userPoints = userToUpdate.userPoints - pointsToDeduct;
            userToUpdate.userUsedPoints = userToUpdate.userUsedPoints + pointsToDeduct;
            await this.userInfoRepository.save(userToUpdate);
            console.log("扣点成功: ", userToUpdate);
            return { isSuccess: true, message: '扣点成功', data: userToUpdate.userPoints };
        } else {
            return { isSuccess: false, message: '扣点失败，点数不足' };
        }

    }

    // 增加点数
    async addPoints(userPhone: string, userEmail: string, pointsToAdd: number) {
        let userToUpdate: any = {};

        if (userPhone !== '')
            userToUpdate = await this.userInfoRepository.findOne({ where: { userPhone } });
        else if (userEmail !== '')
            userToUpdate = await this.userInfoRepository.findOne({ where: { userEmail } });
        else
            return { isSuccess: false, message: '手机号和邮箱均为空' };

        // 检查用户是否存在
        if (!userToUpdate) {
            console.log("用户不存在");
            return { isSuccess: false, message: '用户不存在' };
        }

        // 增加点数
        userToUpdate.userPoints = userToUpdate.userPoints + pointsToAdd;
        await this.userInfoRepository.save(userToUpdate);
        console.log("点数充值成功: ", userToUpdate);
        return { isSuccess: true, message: '点数充值成功', data: userToUpdate.userPoints };

    }


    // 用户登录
    async validateUser(loginInfos: { userNameOrPhoneOrEmail: string, userPassword: string }): Promise<any> {
        // 正则表达式用于匹配邮箱和手机号
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phonePattern = /^1[3-9]\d{9}$/;

        let identifierType: string;
        let user: UserInfo | null = null;

        // console.log(typeof(loginInfos.userNameOrPhoneOrEmail));

        // console.log('这里执行到了');

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

        // console.log("user: ", user);

        // 处理查询结果
        if (user) {
            // 验证密码
            if (user.userPassword === loginInfos.userPassword) {
                console.log("登录成功，欢迎回来，", user.userName);
                return user;
            } else {
                // console.log("密码错误，请重新输入");
                return '密码错误，请重新输入';
            }
        } else {
            // 根据输入类型给出对应的提示
            switch (identifierType) {
                case 'userName':
                    // console.log("用户名不存在，请检查输入");
                    return '用户名不存在，请检查输入';
                case 'userPhone':
                    // console.log("手机号未注册，请先注册");
                    return '手机号未注册，请先注册';
                case 'userEmail':
                    // console.log("邮箱未注册，请先注册");
                    return '邮箱未注册，请先注册';
                default:
                    // console.log("输入不合法，请输入用户名、手机号或邮箱");
                    return '输入不合法，请输入用户名、手机号或邮箱'
            }
        }
    }

    async login(user: any) {
        // 最初userId命名为sub是为了与JWT标准保持一致
        // 后面觉得很乱，就改了
        // 这个payload将access_token与用户的各类信息相关联，从而让用户在提供access_token后能够访问这些信息
        const payload = {
            userName: user.userName,
            userId: user.userId,
            userPassword: user.userPassword,
            userPoints: user.userPoints,
            userPhone: user.userPhone,
            userEmail: user.userEmail,
            userStatus: user.userStatus,
            userLevel: user.userLevel,
            userExpireDate: user.userExpireDate,
            userUsedPoints: user.userUsedPoints,
            userRegisterDate: user.userRegisterDate,
            userAvatarUrl: user.userAvatarUrl
        };

        // 下面这行这是官方文档的写法，但被证明是错误的了，所以更新了写法
        // console.log("access_token: ", this.jwtService.sign(payload));   
        return {
            access_token: this.jwtService.sign(
                payload,
                { secret: jwtConstants.secret }
            )
        };
    }

}


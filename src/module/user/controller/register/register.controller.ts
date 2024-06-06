import { Controller, Get, Post, Render, Req } from '@nestjs/common';
import { SqlService } from 'src/module/sql/service/sql/sql.service';
import { AlimsgService } from 'src/module/api/service/alimsg/alimsg.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('/user/register')
@ApiTags('用户注册相关')
export class RegisterController {

    constructor(
        private readonly sqlService: SqlService,
        private readonly alimsgService: AlimsgService
    ) { }

    //默认方法
    @Get()
    @Render('user/register')
    hello() {

    }

    @Post('post')
    register(@Req() req) {
        const registerParams = {
            userName: req.body.userName,
            userPassword: req.body.userPassword,
            userPhone: req.body.userPhone,
            userEmail: req.body.userEmail,
        }

        this.sqlService.register(registerParams);
        // console.log(registerParams);
    }

    @Get('getcode')
    @ApiOperation({ summary: '获取验证码' })
    async getCode() {
        const smsStatus = await this.alimsgService.sendAndQuerySms(
            "13916839889",
            "云梦智联",
            "SMS_468015004",
        )
        console.log('smsStatus: ', smsStatus);
        return smsStatus;
    }


}

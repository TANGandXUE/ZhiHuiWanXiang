import { Controller, Get, Post, Render, Req } from '@nestjs/common';
import { SqlService } from 'src/module/sql/service/sql/sql.service';
import { AlimsgService } from 'src/module/api/service/alimsg/alimsg.service';

@Controller('/user/register')
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
    async getCode() {
        this.alimsgService.sendAndQuerySms(
            "19102147124",
            "云梦智联",
            "SMS_468015004",
        )
    }


}

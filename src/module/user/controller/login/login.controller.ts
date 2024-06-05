import { Controller, Get, Post, Render, Req } from '@nestjs/common';
import { SqlService } from 'src/module/sql/service/sql/sql.service';

@Controller('/user/login')
export class LoginController {

    constructor(private readonly sqlService: SqlService) { }

    //默认方法
    @Get()
    @Render('user/login')
    hello(){
        
    }

    @Post()
    login(@Req() req){
        const loginParams = {
            userNameOrPhoneOrEmail: req.body.userNameOrPhoneOrEmail,
            userPassword: req.body.userPassword,
        }

        this.sqlService.login(loginParams);
        // console.log(loginParams);
    }


}

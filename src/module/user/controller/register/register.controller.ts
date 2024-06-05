import { Controller, Get, Post, Render, Req } from '@nestjs/common';
import { SqlService } from 'src/module/sql/service/sql/sql.service';

@Controller('/user/register')
export class RegisterController {

    constructor(private readonly sqlService: SqlService) { }

    //默认方法
    @Get()
    @Render('user/register')
    hello(){
        
    }

    @Post()
    register(@Req() req){
        const registerParams = {
            userName: req.body.userName,
            userPassword: req.body.userPassword,
            userPhone: req.body.userPhone,
            userEmail: req.body.userEmail,
        }

        this.sqlService.register(registerParams);
        // console.log(registerParams);
    }


}

import { Controller, Request, UseGuards, Get, Post, Render, Req } from '@nestjs/common';
import { SqlService } from 'src/module/sql/service/sql/sql.service';
import { LoginAuthGuard } from '../../others/auth.guard';
import { JwtAuthGuard } from '../../others/jwt-auth.guard';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('/user/login')
@ApiTags('用户登陆相关')
export class LoginController {

    constructor(private readonly sqlService: SqlService) { }

    //默认方法
    @Get()
    @ApiOperation({ summary: '测试用页面' })
    @Render('user/login')
    hello() {

    }

    // // 旧版方法
    // @Post('abandoned')
    // loginAbandonded(@Req() req) {
    //     const loginParams = {
    //         userNameOrPhoneOrEmail: req.body.userNameOrPhoneOrEmail,
    //         userPassword: req.body.userPassword,
    //     }

    //     this.sqlService.validateUser(loginParams);
    //     // console.log(loginParams);
    // }


    // 登陆，并获取包含全部payload(userInfo数据库中的所有对象)的JWT
    // 如果数据库对象有更新，必须要去sql.service.ts和jwt.strategy.ts中往payload中新增对应的key
    @UseGuards(LoginAuthGuard)
    @ApiOperation({ summary: '用户登陆' })
    @Post()
    async login(@Request() req) {
        //经过LoginAuthGuard调用的auth.strategy.ts后，req中新增了user，并存储了用户信息
        // console.log(' 登录成功', req.user)
        return this.sqlService.login(req.user);
    }


    // 测试根据JWT获取用户信息
    @UseGuards(JwtAuthGuard)
    @Get('test')
    getProfile(@Request() req) {
        return req.user;
    }


}

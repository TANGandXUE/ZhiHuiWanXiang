import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';
import { SqlService } from 'src/module/sql/service/sql/sql.service';


@Injectable()
export class UserMiddleware implements NestMiddleware {

  constructor(private sqlService: SqlService) { }
  async use(req: any, res: Response, next: NextFunction) {
    const logger = new Logger();

    //请求参数
    let userName = req.body['userPassword'];
    let userPassword = req.body['userPassword'];
    let userPhoneOrEmail = req.body['userPhoneOrEmail'];
    // console.log(req.body)

    // 用户名逻辑
    if (userName === '') {
      // response返回错误:用户名不能为空
      logger.error("用户名不能为空");
    } else if (await this.sqlService.elementExist("userName", userName) != null) {
      // response返回错误:用户名已存在
    }

    // 密码逻辑
    if (userPassword === '') {
      // reponse返回错误:密码不能为空
      logger.error('密码不能为空');
    }

        // 手机号/邮箱逻辑
    // 先初始化
    req.body['userPhone'] = '';
    req.body['userEmail'] = '';

    if (userPhoneOrEmail === '') {
      // response返回错误:手机号/邮箱不能为空
      logger.error('手机号/邮箱不能为空');
    } else {
      // 手动验证手机号
      const phoneRegex = /^1[3-9]\d{9}$/; // 简单的中国大陆手机号正则表达式
      let isPhoneValid = phoneRegex.test(userPhoneOrEmail);

      // 手动验证邮箱
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      let isEmailValid = emailRegex.test(userPhoneOrEmail);

      if (isPhoneValid) {
        req.body['userPhone'] = userPhoneOrEmail;
      } else if (isEmailValid) {
        req.body['userEmail'] = userPhoneOrEmail;
      } else {
        // 返回错误
        logger.error('手机号/邮箱格式不正确');
        console.log(userPhoneOrEmail);
      }
    }



    //跳出中间件
    next();
  }
}

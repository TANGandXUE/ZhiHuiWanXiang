import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SqlService } from 'src/module/sql/service/sql/sql.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private sqlService: SqlService) {
        super();
    }

    async validate(userNameOrPhoneOrEmail: string, password: string): Promise<any> {
        // //打印输入的userNameOrPhoneOrEmail这个值是否为空，打印为true和false
        // if(userNameOrPhoneOrEmail == ''){
        //     console.log('userNameOrPhoneOrEmail不存在');
        // }

        
        
        const dto = await this.sqlService.validateUser({
            userNameOrPhoneOrEmail,
            userPassword:password,
        });
        if (typeof(dto) == 'string') {
            console.log(dto);
            throw new UnauthorizedException();
        } else {
            return dto;
        }
    }
}
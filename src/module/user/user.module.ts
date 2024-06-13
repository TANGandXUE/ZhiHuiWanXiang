import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UploadController } from './controller/upload/upload.controller';
import { DownloadController } from './controller/download/download.controller';
import { UploadService } from './service/upload/upload.service';
import { SqlModule } from '../../module/sql/sql.module';
import { ApiModule } from '../api/api.module';
import { DatatransService } from 'src/service/datatrans/datatrans.service';
import { UserMiddleware } from './middleware/user.middleware';
import { RegisterController } from './controller/register/register.controller';
import { LoginController } from './controller/login/login.controller';
import { JwtStrategy } from './others/jwt.strategy';
import { LocalStrategy } from './others/local.strategy';
import { ForgetpasswordMiddleware } from './middleware/forgetpassword.middleware';


@Module({
  imports: [SqlModule, ApiModule],
  controllers: [UploadController, DownloadController, RegisterController, LoginController],
  providers: [UploadService, DatatransService, LocalStrategy, JwtStrategy],
  exports:[],
})

//使用中间件截取请求
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
      consumer
      .apply(UserMiddleware)
      .forRoutes('user/register/post'),
      consumer
      .apply(ForgetpasswordMiddleware)
      .forRoutes('user/register/forgetpassword')
  }

}

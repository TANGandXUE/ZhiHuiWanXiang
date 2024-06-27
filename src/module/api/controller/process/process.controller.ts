import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/module/user/others/jwt-auth.guard';
import { ProcessService } from '../../service/process/process.service';
import { getApiList } from 'src/others/apiList';

@Controller('api/process')
export class ProcessController {

    constructor(private readonly processService: ProcessService) { }

    // 查询API List
    @Get('getapilist')
    @UseGuards(JwtAuthGuard)
    getApiList(@Req() req) {
        return getApiList(req.user.userLevel);
    }

    // 发起修图任务
    @Post()
    @UseGuards(JwtAuthGuard)
    async startProcess(@Req() req) {
        // console.log(req.user);
        return await this.processService.startProcess(
            req.body.fileInfos_url,
            req.body.text,
            req.user.userId,
            req.body.useApiList,
            req.body.isPreview,
        )
    }

    // 查询修图任务
    @Post('query')
    @UseGuards(JwtAuthGuard)
    async queryProcess(@Req() req) {
        // console.log('啊啊啊啊啊啊啊aaaaa: ', await this.processService.queryProcess(req.body.workId));
        return await this.processService.queryProcess(req.body.workId);
    }

    // 根据JWT获取支付记录
    @UseGuards(JwtAuthGuard)
    @Get('syncinfos')
    async syncInfos(@Req() req) {
        // userId是必然不会变动的信息，所以用UseGuards来从JWT中取出，以从数据库中获取动态信息
        const workUserId = req.user.userId;
        return await this.processService.getWorkInfos(workUserId);
    }

}

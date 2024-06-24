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
        return await this.processService.queryProcess(req.body.workId);
    }

}

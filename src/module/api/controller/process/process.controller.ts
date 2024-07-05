import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/module/user/others/jwt-auth.guard';
import { ProcessService } from '../../service/process/process.service';
import { getApiList } from 'src/others/apiList';
import { paramsForApis } from 'src/others/paramsForApis';

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

    // 发起重新生成预览图任务
    @Post('reprocess')
    @UseGuards(JwtAuthGuard)
    async startReprocess(@Req() req) {
        // console.log(req.user);
        return await this.processService.startReprocess(
            req.body.fileInfos_url,
            req.user.userId,
            req.body.useApiList,
            req.body.params,
        )
    }

    // 发起批量修图任务
    @Post('finalprocess')
    @UseGuards(JwtAuthGuard)
    async startFinalProcess(@Req() req) {
        // console.log(req.user);
        return await this.processService.startFinalProcess(
            req.body.fileInfos_url,
            req.user.userId,
            req.body.useApiList,
            req.body.params,
        )
    }

    // 查询修图任务
    @Post('query')
    @UseGuards(JwtAuthGuard)
    async queryProcess(@Req() req) {
        // console.log('啊啊啊啊啊啊啊aaaaa: ', await this.processService.queryProcess(req.body.workId));
        return await this.processService.queryProcess(req.body.workId);
    }

    // 根据JWT获取绘图记录
    @Get('syncinfos')
    @UseGuards(JwtAuthGuard)
    async syncInfos(@Req() req) {
        // userId是必然不会变动的信息，所以用UseGuards来从JWT中取出，以从数据库中获取动态信息
        const workUserId = req.user.userId;
        return await this.processService.getWorkInfos(workUserId);
    }

    // 查询txt2params使用的临时参数
    @Post('queryparams')
    @UseGuards(JwtAuthGuard)
    async queryParams(@Req() req) {
        return await this.processService.queryParams(req.body.workId);
    }

    // 查询txt2params使用的所有参数
    @Get('queryallparams')
    @UseGuards(JwtAuthGuard)
    queryAllParams() {
        return { isSuccess: true, message: '查询txt2params使用的所有参数成功', data: paramsForApis };
    }

}

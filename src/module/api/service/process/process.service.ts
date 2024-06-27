import { Injectable } from '@nestjs/common';

// 引入服务
import { ChatqwenService } from '../chatqwen/chatqwen.service';
import { MeituautoService } from '../meituauto/meituauto.service';
import { DatatransService } from 'src/service/datatrans/datatrans.service';
import { OssService } from 'src/module/sql/service/oss/oss.service';
import { SqlService } from 'src/module/sql/service/sql/sql.service';

// 数据库相关
import { InjectRepository } from '@nestjs/typeorm';
import { UserInfo } from 'src/entities/userinfo.entity';
import { WorkInfo } from 'src/entities/workinfo.entity';
import { getApiList } from 'src/others/apiList';
import { Repository } from 'typeorm';

// .env
import * as dotenv from 'dotenv';
dotenv.config();


@Injectable()
export class ProcessService {

    constructor(

        // 服务初始化
        private readonly chatqwenService: ChatqwenService,
        private readonly meituautoService: MeituautoService,
        private readonly datatransService: DatatransService,
        private readonly ossService: OssService,
        private readonly sqlService: SqlService,

        // 数据库相关
        @InjectRepository(UserInfo)
        private readonly userInfoRepository: Repository<UserInfo>,
        @InjectRepository(WorkInfo)
        private readonly workInfoRepository: Repository<WorkInfo>,

    ) { }

    // 开始修图
    async startProcess(

        fileInfos_url: Array<{ fileName: string, fileURL: string }>,
        text: string,    // 自然语言
        userId: number,  // 用户ID
        useApiList: Array<string>,  // 使用的API
        isPreview: boolean,  // 是否是生成预览图

    ): Promise<{ isSuccess: boolean, message: string, data: any }> {

        // 根据用户Id获取用户信息
        const userInfos = await this.userInfoRepository.findOne({ where: { userId } })
        if (!userInfos) return { isSuccess: false, message: '用户不存在', data: null }

        // 判断使用的API列表是否在该用户等级所能使用的列表之内
        const allowedApiList = getApiList(userInfos.userLevel)
        if (!useApiList.every(api => allowedApiList.includes(api)))
            return { isSuccess: false, message: '当前调用的API中，有部分或全部，不在该用户的用户等级所能使用的API列表之内', data: null };

        // 根据今天的日期随机生成一个20位workId
        const now = new Date();
        const datePart = now.toISOString().slice(0, 19).replace(/-/g, '').replace(/T/, '').replace(/:/g, '');
        const randomPart = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
        const workId = datePart + randomPart;

        // 初始化workInfo
        const workInfo = new WorkInfo();
        workInfo.workId = workId;
        workInfo.workUserId = userId;
        workInfo.workText = text;
        workInfo.workApiList = useApiList;
        workInfo.workStartTime = new Date();
        workInfo.workStatus = 'processing';
        workInfo.workUsePoints = 0;
        workInfo.workUseTime = 0;
        workInfo.workResult = [];
        workInfo.workErrorInfos = [];
        workInfo.isPreview = isPreview;
        this.workInfoRepository.save(workInfo);
        console.log('workInfo: ', workInfo);

        // 启动异步修图任务
        this.img2img(workInfo, fileInfos_url, useApiList);

        return { isSuccess: true, message: '发起修图任务成功', data: workId };

    }

    // 图片格式转换
    private async img2img(
        workInfo: {
            workId: string,
            workUserId: number,
            workText: string,
            workApiList: Array<string>,
            workStartTime: Date,
            workStatus: string,
            workUsePoints: number,
            workUseTime: number,
            workResult: Array<any>,
            workErrorInfos: Array<any>,
            isPreview: boolean,
        },
        fileInfos_url: Array<{ fileName: string, fileURL: string }>,
        useApiList: Array<string>,
    ) {
        
        // 根据执行结果进行下一步操作
        try {
            fileInfos_url = await this.datatransService.img2img(fileInfos_url, { outputFormat: 'jpg', quality: 100 })
            // 传值，接力执行修图任务
            this.txt2params(workInfo, fileInfos_url, useApiList);
        } catch (error) {
            console.log(error);
            workInfo.workStatus = 'failed';
            workInfo.workErrorInfos.push({
                fromAPI: 'txt2params',
                message: `文本转参数时出现错误，错误信息为：'${error}'`,
            })
            this.workInfoRepository.save(workInfo);
        }

    }

    // 文本转参数
    private async txt2params(
        workInfo: {
            workId: string,
            workUserId: number,
            workText: string,
            workApiList: Array<string>,
            workStartTime: Date,
            workStatus: string,
            workUsePoints: number,
            workUseTime: number,
            workResult: Array<any>,
            workErrorInfos: Array<any>,
            isPreview: boolean,
        },
        fileInfos_url: Array<{ fileName: string, fileURL: string }>,
        useApiList: Array<string>,
    ) {

        console.log('fileInfos_url: ', fileInfos_url);

        // 总参数列表
        const params: any = {};
        let isSuccess: boolean = true;

        // 生成meituauto参数
        if (useApiList.includes('meituauto')) {
            params['meituauto'] = await this.chatqwenService.txt2param(workInfo.workText, "meituauto");
            if (Object.keys(params['meituauto']).length === 0) isSuccess = false;
        }
        // 生成其他参数...

        console.log('params: ', params);

        // 根据执行结果进行下一步操作
        if (!isSuccess) {
            workInfo.workStatus = 'failed';
            // console.log('workInfo: ', workInfo);
            this.workInfoRepository.save(workInfo);
        }
        else {
            // console.log('workInfo: ', workInfo);
            // 传值，接力执行修图任务
            this.imgProcess(workInfo, fileInfos_url, params, useApiList);
        }
    }

    // 图片处理
    private async imgProcess(
        workInfo: {
            workId: string,
            workUserId: number,
            workText: string,
            workApiList: Array<string>,
            workStartTime: Date,
            workStatus: string,
            workUsePoints: number,
            workUseTime: number,
            workResult: Array<any>,
            workErrorInfos: Array<any>,
            isPreview: boolean,
        },
        fileInfos_url: Array<{ fileName: string, fileURL: string }>,
        params: {
            meituauto: any,
        },
        useApiList: Array<string>,
    ) {


        // 根据是否是预览图模式，来重写fileInfos_url
        if (workInfo.isPreview)
            fileInfos_url = [fileInfos_url[0]]; // 如果是预览图模式，则只使用第一张图
        else {
            // 如果不是生成预览图模式，则去除第一张图
            fileInfos_url = fileInfos_url.slice(1);
            // 如果除了预览图，没有别的图了，直接修改workInfo的状态为completed
            if (fileInfos_url.length === 0) {
                workInfo.workStatus = 'completed';
                // workInfo.workUsePoints不用写，因为如果除了预览图没有别的图了，也就不用扣除点数了，也就不用修改默认的0
                this.workInfoRepository.save(workInfo);
                // console.log('workInfo: ', workInfo);
                return;
            }
        }


        // 初始化workResult，这样在后续处理图片时，如果出现了错误，那就直接使用当前workResult中的数据继续处理，并把相关错误写入workErrorInfos，而不会直接导致修图任务失败
        workInfo.workResult = fileInfos_url;


        // 调用meituauto接口------------------------------------------------
        // 定义一个封装了MeituAuto的Promise
        if (useApiList.includes('meituauto')) {
            const meituAutoPromise = new Promise((resolve, reject) => {
                this.meituautoService.meitu_auto(fileInfos_url, params.meituauto, (results_url, message) => {
                    // 如果存在错误，写入errorInfos
                    if (message.length > 0) {
                        workInfo.workErrorInfos.push({
                            fromAPI: 'meituAuto',
                            message,
                        })
                    }
                    if (results_url) {
                        console.log('meituauto执行结束: ', results_url);

                        this.datatransService.urlToLocal(results_url, 'jpg').then(fileInfos => {
                            // console.log(fileInfos);
                            resolve(fileInfos);
                        }).catch(err => {
                            reject(err);
                        });
                    } else {
                        reject(new Error('meituauto执行后未返回结果'));
                    }
                })
            });
            //调用MeituAutoPromise
            try {
                //调用MeituAutoPromise并上传到oss返回链接
                let res: any = await meituAutoPromise;
                workInfo.workResult = await this.ossService.uploadFiles(await this.ossService.reNameFileInfos(res));
            } catch (error) {
                console.error('meituauto执行出错: ', error);
                workInfo.workErrorInfos.push({
                    fromAPI: 'meituAuto',
                    message: `调用meituAuto方法时出现错误，错误信息为：'${error}'`,
                })
            }
        }

        // 调用其他接口-----------------------------------------------------



        // 根据执行结果进行下一步操作
        workInfo.workUseTime = new Date().getTime() - workInfo.workStartTime.getTime();
        if (
            // 如果两个完全相等，就意味着所有处理没有起到任何作用，也就等同于处理失败
            workInfo.workResult === fileInfos_url
        ) {
            workInfo.workStatus = 'failed';
            // workInfo.workUsePoints不用写，因为处理失败也就是默认值的0，不用修改
            this.workInfoRepository.save(workInfo);
        } else {
            workInfo.workStatus = 'completed';
            workInfo.workUsePoints = await this.deductPoints(workInfo);
            this.workInfoRepository.save(workInfo);
            console.log('1workInfo: ', workInfo);
        }

    }


    // 扣除点数
    private async deductPoints(
        workInfo: {
            workId: string,
            workUserId: number,
            workText: string,
            workApiList: Array<string>,
            workStartTime: Date,
            workStatus: string,
            workUsePoints: number,
            workUseTime: number,
            workResult: Array<any>,
            workErrorInfos: Array<any>,
            isPreview: boolean,
        },
    ) {

        // 计算扣除点数
        const baseDeductPoints = Number(process.env.DEDUCT_POINTS_FOR_PROCESS || 10);
        const PointsToDeduct = workInfo.workResult.length * baseDeductPoints;

        // 查找用户信息并扣点
        const userInfos = await this.userInfoRepository.findOne({ where: { userId: workInfo.workUserId } })
        await this.sqlService.deductPoints(userInfos.userPhone, userInfos.userEmail, PointsToDeduct)
        // console.log('UserInfo: ', userInfos);

        
        console.log('2workInfo: ', workInfo);

        return PointsToDeduct;

    }


    // 查询修图相关信息
    async queryProcess(workId: string): Promise<{ isSuccess: boolean, message: string, data: any }> {

        // 根据workId获取workInfo
        const workInfo = await this.workInfoRepository.findOne({ where: { workId } });
        console.log('啊啊啊啊啊啊啊啊啊啊啊啊: ', workInfo);

        if (!workInfo)
            return { isSuccess: false, message: '该workId对应的任务不存在', data: null };
        else
            return { isSuccess: true, message: '查询修图状态成功', data: workInfo };

    }

    // 获取工作记录
    async getWorkInfos(workUserId: number) {
        let workListToGet: any = {};
        workListToGet = await this.workInfoRepository.find({ where: { workUserId } });
        console.log("workListToGet: ", JSON.stringify(workListToGet[0]));
        return { isSuccess: true, message: '获取工作记录成功', data: workListToGet };
    }


}

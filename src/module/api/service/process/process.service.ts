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
import { Any, Repository } from 'typeorm';

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


    // 公共参数
    timeout_meituauto: number = Number(process.env.MEITUAUTO_TIMEOUT || 60000)
    timeout_urlToLocal: number = Number(process.env.DOWNLOAD_TIMEOUT || 60000)
    timeout_uploadFiles: number = Number(process.env.UPLOAD_TIMEOUT || 60000)





    // 开始修图
    async startProcess(

        fileInfos_url: Array<{ fileName: string, fileURL: string }>,
        text: string,    // 自然语言
        userId: number,  // 用户ID
        useApiList: Array<string>,  // 使用的API
        isPreview: boolean,  // 是否是生成预览图

    ): Promise<{ isSuccess: boolean, message: string, data: any }> {

        try {

            // 根据用户Id获取用户信息
            const userInfos = await this.userInfoRepository.findOne({ where: { userId } })
            if (!userInfos) return { isSuccess: false, message: '用户不存在', data: null }

            // 判断使用的API列表是否在该用户等级所能使用的列表之内
            const allowedApiList = getApiList(userInfos.userLevel)
            if (!useApiList.every(api => allowedApiList.includes(api)))
                return { isSuccess: false, message: '当前调用的API中，有部分或全部，不在该用户的用户等级所能使用的API列表之内', data: null };

            // 根据今天的日期随机生成一个20位workId
            let workId: string = '';
            while (true) {
                // 生成
                const now = new Date();
                const datePart = now.toISOString().slice(0, 19).replace(/-/g, '').replace(/T/, '').replace(/:/g, '');
                const randomPart = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
                workId = datePart + randomPart;

                // 检查是否重复
                const existWorkInfo = await this.workInfoRepository.findOne({ where: { workId } });
                if (!existWorkInfo) break;
            }

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
            await this.workInfoRepository.save(workInfo);
            console.log('workId: ', workId);
            console.log('发起修图任务成功');
            console.log('发起修图任务成功');
            console.log('发起修图任务成功');
            console.log('发起修图任务成功');
            console.log('发起修图任务成功');
            console.log('发起修图任务成功');
            console.log('发起修图任务成功');
            console.log('发起修图任务成功');
            console.log('发起修图任务成功');
            console.log('发起修图任务成功');
            console.log('发起修图任务成功');
            console.log('发起修图任务成功');

            // 启动异步修图任务的第一步--转换图片格式
            this.img2img(workInfo, fileInfos_url, useApiList);

            return { isSuccess: true, message: '发起修图任务成功', data: workId };

        } catch (error) {
            console.log(error);
            return { isSuccess: false, message: `发起修图任务失败，原因为: ${error}`, data: null };
        }

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


        // 如果是预览图模式，则只使用第一张图
        if (workInfo.isPreview) {    
            fileInfos_url = [fileInfos_url[0]];       
        } else {
            // 如果不是预览图，那第一张图就不需要转换格式了
            fileInfos_url = fileInfos_url.slice(1);
            // 如果除了预览图，没有别的图了，直接修改workInfo的状态为completed
            if (fileInfos_url.length === 0) {
                workInfo.workStatus = 'completed';
                // workInfo.workUsePoints不用写，因为如果除了预览图没有别的图了，也就不用扣除点数了，也就不用修改默认的0
                await this.workInfoRepository.save(workInfo);
                // console.log('workInfo: ', workInfo);
                return;
            }
        }

        // 根据执行结果进行下一步操作
        try {
            const responseData_img2img = await this.datatransService.img2img(fileInfos_url, { outputFormat: 'jpg', quality: 100 });
            // console.log('啊啊啊啊啊啊啊aaaaaaaaaaaaa : ', responseData_img2img);
            if (responseData_img2img.isSuccess) {

                // 判断是全部图片转换成功还是部分成功
                if (responseData_img2img.message === `图片类型转换成功`) {
                    fileInfos_url = responseData_img2img.data;
                    // 传值，接力执行修图任务
                    this.txt2params(workInfo, fileInfos_url, useApiList);
                } else {
                    workInfo.workErrorInfos.push({
                        fromAPI: 'img2img',
                        message: `图片格式转换时出现错误，原因为: ${responseData_img2img.message}`,
                    })
                    await this.workInfoRepository.save(workInfo);
                    fileInfos_url = responseData_img2img.data;
                    // 传值，接力执行修图任务
                    this.txt2params(workInfo, fileInfos_url, useApiList);
                }

            } else {
                console.log(responseData_img2img.message);
                workInfo.workStatus = 'failed';
                workInfo.workErrorInfos.push({
                    fromAPI: 'img2img',
                    message: `图片格式转换时出现错误，原因为: ${responseData_img2img.message}`,
                })
                await this.workInfoRepository.save(workInfo);
            }
        } catch (error) {
            console.log(error);
            workInfo.workStatus = 'failed';
            workInfo.workErrorInfos.push({
                fromAPI: 'img2img',
                message: `图片格式转换时出现错误，原因为：${error}`,
            })
            await this.workInfoRepository.save(workInfo);
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
        try {

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
                workInfo.workErrorInfos.push({
                    fromAPI: 'txt2params',
                    message: `文本转参数时出现错误，原因未知`,
                })
                await this.workInfoRepository.save(workInfo);
            }
            else {
                // console.log('workInfo: ', workInfo);
                // 传值，接力执行修图任务
                this.imgProcess(workInfo, fileInfos_url, params, useApiList);
            }

        } catch (error) {
            workInfo.workStatus = 'failed';
            workInfo.workErrorInfos.push({
                fromAPI: 'txt2params',
                message: `文本转参数时出现错误，原因为：${error}`
            });
            await this.workInfoRepository.save(workInfo);
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
                        });
                    }
                    if (results_url) {
                        console.log('meituauto执行结束: ', results_url);

                        // 创建urlToLocal的超时Promise
                        const urlToLocalTimeoutPromise = new Promise((_, reject) => {
                            setTimeout(() => {
                                reject(new Error(`urlToLocal执行超时（${this.timeout_urlToLocal / 1000}秒）`));
                            }, this.timeout_urlToLocal);
                        });

                        // 使用Promise.race处理urlToLocal的超时
                        Promise.race([
                            this.datatransService.urlToLocal(results_url, 'jpg'),
                            urlToLocalTimeoutPromise
                        ]).then(fileInfos => resolve(fileInfos))
                            .catch(err => reject(err));
                    } else {
                        reject(new Error('meituauto执行后未返回结果'));
                    }
                });
            });

            // 创建meituAuto的超时Promise
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => {
                    reject(new Error(`meituAuto执行超时（${this.timeout_meituauto / 1000}秒）`));
                }, this.timeout_meituauto);
            });

            // 使用Promise.race同时监听meituAutoPromise和timeoutPromise
            let response_fileInfos: any;
            let renamed_response_fileInfos: any;
            try {
                response_fileInfos = await Promise.race([meituAutoPromise, timeoutPromise]);

                // 创建uploadFiles的超时Promise
                const uploadFilesTimeoutPromise: any = new Promise((_, reject) => {
                    setTimeout(() => {
                        reject(new Error(`uploadFiles执行超时（${this.timeout_uploadFiles / 1000}秒）`));
                    }, this.timeout_uploadFiles);
                });

                renamed_response_fileInfos = await this.ossService.reNameFileInfos(response_fileInfos);

                // 使用Promise.race处理uploadFiles的超时
                workInfo.workResult = await Promise.race([
                    this.ossService.uploadFiles(renamed_response_fileInfos),
                    uploadFilesTimeoutPromise
                ]);
                console.log('此处的workInfo.workResult: ', workInfo.workResult)
            } catch (error) {
                let errorMessage = error.message;

                // 判断是超时错误，还是其他错误
                if (errorMessage.includes('超时')) {
                    workInfo.workErrorInfos.push({
                        fromAPI: errorMessage.includes('meituAuto') ? 'meituAuto' : errorMessage.includes('urlToLocal') ? 'urlToLocal' : 'uploadFiles',
                        message: errorMessage,
                    });
                } else {
                    workInfo.workErrorInfos.push({
                        fromAPI: 'meituAuto',
                        message: `调用相关方法时出现错误，错误信息为：${JSON.stringify(error)}`,
                    });
                }
            } finally {
                // 调用deleteFileInfos并处理返回信息，但不阻塞流程
                this.datatransService.deleteFileInfos(renamed_response_fileInfos)
                    .then(result => {
                        if (!result.isSuccess) {
                            console.error(result.message); // 记录失败的删除信息
                        } else {
                            console.log(result.message); // 记录成功信息
                        }
                    })
                    .catch(err => {
                        console.error('在尝试删除response_fileInfos时遇到未知错误:', err);
                    });
            }
        }

        // 调用其他接口-----------------------------------------------------



        // 根据执行结果进行下一步操作
        workInfo.workUseTime = new Date().getTime() - workInfo.workStartTime.getTime();
        console.warn('workInfo.workResult: ', workInfo.workResult);
        console.warn('fileInfos_url:', fileInfos_url);
        if (
            // 如果两个完全相等，就意味着所有处理没有起到任何作用，也就等同于处理失败
            workInfo.workResult === fileInfos_url
        ) {
            workInfo.workStatus = 'failed';
            // workInfo.workUsePoints不用写，因为处理失败也就是默认值的0，不用修改
            workInfo.workErrorInfos.push({
                fromAPI: '所有API',
                message: `所有API方法执行后均未返回结果`,
            })
            await this.workInfoRepository.save(workInfo);
        } else {
            workInfo.workStatus = 'completed';
            workInfo.workUsePoints = await this.deductPoints(workInfo);
            await this.workInfoRepository.save(workInfo);
            // console.log('1workInfo: ', workInfo);
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

        try {

            // 计算扣除点数
            const baseDeductPoints = Number(process.env.DEDUCT_POINTS_FOR_PROCESS || 10);
            const PointsToDeduct = workInfo.workResult.length * baseDeductPoints;

            // 查找用户信息并扣点
            const userInfos = await this.userInfoRepository.findOne({ where: { userId: workInfo.workUserId } })
            await this.sqlService.deductPoints(userInfos.userPhone, userInfos.userEmail, PointsToDeduct)
            // console.log('UserInfo: ', userInfos);


            // console.log('2workInfo: ', workInfo);

            return PointsToDeduct;

        } catch (error) {
            // workInfo.workStatus = 'failed'不用写
            // 因为图已经生成完了，就是扣点失败罢了......
            // 妈的如果有一天真的进了这个catch，我真的会疯..........
            workInfo.workErrorInfos.push({
                fromAPI: '扣点API',
                message: `扣点失败`,
            });
            await this.workInfoRepository.save(workInfo);
        }

    }


    // 查询修图相关信息
    async queryProcess(workId: string): Promise<{ isSuccess: boolean, message: string, data: any }> {

        // 根据workId获取workInfo
        const workInfo = await this.workInfoRepository.findOne({ where: { workId } });

        if (!workInfo)
            return { isSuccess: false, message: '该workId对应的任务不存在', data: null };
        else
            return { isSuccess: true, message: '查询修图状态成功。如发生错误，请前往历史记录面板查看。', data: workInfo };

    }

    // 获取工作记录
    async getWorkInfos(workUserId: number) {
        let workListToGet: any = {};
        workListToGet = await this.workInfoRepository.find({ where: { workUserId } });
        console.log("workListToGet: ", JSON.stringify(workListToGet[0]));
        return { isSuccess: true, message: '获取工作记录成功', data: workListToGet };
    }


}

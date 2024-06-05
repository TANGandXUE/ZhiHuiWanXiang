import { Injectable, Logger } from '@nestjs/common';
import Dysmsapi, { SendSmsRequest, QuerySendDetailsRequest } from '@alicloud/dysmsapi20170525';
import * as OpenApi from '@alicloud/openapi-client';

@Injectable()
export class AlimsgService {
    private dysmsapiClient: Dysmsapi;

    constructor() {
        const accessKeyId = 'LTAI5tAvgeCUuzy6CNxGiUz1';
        const accessKeySecret = 'ajWhks5RfG5YzmPtvOJ1y06TivUPdE';

        const config = new OpenApi.Config({});
        config.accessKeyId = accessKeyId;
        config.accessKeySecret = accessKeySecret;

        this.dysmsapiClient = new Dysmsapi(config);
    }

    async sendAndQuerySms(phoneNumbers: string, signName: string, templateCode: string): Promise<any> {

        //是否发送
        let isSend = false;

        // 生成一个六位随机数
        const randomCode = Math.floor(Math.random() * 900000) + 100000;

        try {
            // 1. 发送短信
            const sendReq = new SendSmsRequest({
                phoneNumbers,
                signName,
                templateCode,
                templateParam: `{"code": ${'' + randomCode}}`
            });
            const sendResp = await this.dysmsapiClient.sendSms(sendReq);
            const code = sendResp.body.code;
            if (code !== 'OK') {
                console.error(`错误信息: ${sendResp.body.message}`);
                return;
            }

            const bizId = sendResp.body.bizId;
            console.log(`等待阿里云返回短信发送结果: ${bizId}`);
            // 2. 等待 10 秒后查询结果
            await new Promise(resolve => setTimeout(resolve, 10000));
            // 3. 查询结果
            const phoneNums = phoneNumbers.split(',');

            //获取当前时间
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0'); // getMonth() returns 0-11, so we add 1
            const day = String(now.getDate()).padStart(2, '0');
            const sendDate = `${year}${month}${day}`

            for (const phoneNum of phoneNums) {
                const queryReq = new QuerySendDetailsRequest({
                    phoneNumber: phoneNum,
                    bizId,
                    sendDate, // Format as yyyyMMdd
                    pageSize: 10,
                    currentPage: 1,
                });
                const queryResp = await this.dysmsapiClient.querySendDetails(queryReq);
                // console.log(`查询结果: ${JSON.stringify(queryResp.body.smsSendDetailDTOs.smsSendDetailDTO)}`);
                const dtos: any = queryResp.body.smsSendDetailDTOs.smsSendDetailDTO || [];

                // 打印结果
                for (const dto of dtos) {
                    if (dto.sendStatus === 3) {
                        console.log(`${dto.phoneNum} 发送成功，接收时间: ${dto.receiveDate}`);
                        isSend = true;
                    } else if (dto.sendStatus === 2) {
                        console.log(`${dto.phoneNum} 发送失败`);
                        isSend = false;
                    } else {
                        console.log(`${dto.phoneNum} 正在发送中...`);
                        isSend = false;
                    }
                }
            }
        } catch (error) {
            console.error('发送或查询短信时发生错误', error);
            isSend = false;
        }

        return {isSend, randomCode}
    }
}
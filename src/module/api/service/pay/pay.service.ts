// pay.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import * as crypto from 'crypto';
import * as dotenv from 'dotenv';
dotenv.config();
import { Pay } from 'src/entities/pay.entity';
import { Any, Repository } from 'typeorm';

@Injectable()
export class PayService {

    constructor(
        @InjectRepository(Pay)
        private readonly payRepository: Repository<Pay>
    ) { }


    private apiUrl = process.env.PAY_BASE_URL || 'https://pay.tangandxue.com/mapi.php';
    private apiKey = process.env.PAY_API_KEY;



    // 初始化订单参数
    private data: any = {
        pid: Number(process.env.PAY_ID || '1000'),
        type: 'wxpay',
        out_trade_no: '202406170211',
        notify_url: process.env.PAY_NOTIFY_URL || 'https://31d5424h62.zicp.fun/api/pay/notify',
        name: 'VIP商品',
        money: '0.01',
        clientip: process.env.PAY_CLIENT_IP || '192.168.1.100',
        device: 'wechat',
    };
    private userId = 1;
    private addPoints = 0;
    private addExpireDate = null;
    private addLevel = 0;

    // 查找订单信息是否存在
    private async elementExist(findKey: any, findValue: any) {
        // 根据提供的字段名和值查询用户信息
        return await this.payRepository.findOne({ where: { [findKey]: findValue } });
    }

    // 生成订单号
    private generateTradeNo(): string {
        const currentDate = new Date();
        const datePart = currentDate.toISOString().split('T')[0].replace(/-/g, ''); // 移除短横线
        const randomPart = Math.floor(Math.random() * 100000000).toString().padStart(8, '0'); // 生成0-1亿之间的随机数并补零至8位
        return `${datePart}${randomPart}`;
    }

    public async startPayment(itemName: string, itemPrice: string, payMethod: string, deviceType: string, userId: number, addPoints: number, addExpireDate: Date, addLevel: number): Promise<any> {
        // 传入订单参数 to 数据库
        this.userId = userId;
        this.addPoints = addPoints;
        if (addExpireDate != null) this.addExpireDate = addExpireDate;
        this.addLevel = addLevel;

        // 传入订单参数 to Snapay
        this.data.name = itemName;
        this.data.money = itemPrice;
        this.data.type = payMethod;
        this.data.device = deviceType;
        // 递归生成订单号，直至无重复为止
        const generateTradeNoUntilNoRepeat = async () => {
            this.data.out_trade_no = this.generateTradeNo();
            if (await this.elementExist('payertradeId', this.data.out_trade_no)) {
                generateTradeNoUntilNoRepeat();
            }
        }
        generateTradeNoUntilNoRepeat();

        this.data.sign = this.sign(this.data, this.apiKey); // 生成签名(不含sign和sign_type)
        this.data.sign_type = 'MD5';

        console.log(this.data);


        try {
            const response = await axios.post(this.apiUrl, this.data, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            delete this.data.sign;
            delete this.data.sign_type;
            // 将trade_no和out_trade_no合并
            this.data.out_trade_no = response.data.trade_no
            console.log('更改后的data为', this.data);
            if (response.data.code == 1)
                return { isSuccess: true, message: "发起支付成功2", data: response.data }
            else
                return { isSuccess: false, message: `发起支付成功，但Snapay返回异常: ${response.data}` }
        } catch (error) {
            return { isSuccess: false, message: "发起支付失败" }
        }
    }


    /* 加密签名 */
    private sign(params: object, apiKey: string) {
        const str =
            Object.keys(params)
                .sort()
                .map((key) => `${key}=${params[key]}`)
                .join('&') + apiKey;
        return crypto.createHash('md5').update(str).digest('hex');
    }


    // 处理支付结果
    public async handleNotification(req: any): Promise<string> {
        // // 验证签名逻辑类似initiatePayment中的签名生成，但需基于接收到的请求参数
        // const sortedParams = Object.keys(req.query)
        //     .sort()
        //     .filter(key => key !== 'sign' && key !== 'sign_type' && req.query[key] !== '')
        //     .reduce((acc, key) => `${acc}${key}=${req.query[key]}&`, '');
        const receivedSign = req.query.sign;
        delete req.query.sign;
        delete req.query.sign_type;
        const calculatedSign = this.sign(req.query, this.apiKey);

        if (receivedSign === calculatedSign) {
            // 将支付结果存入数据库
            const payInfo = new Pay();
            payInfo.payertradeId = this.data.out_trade_no;
            payInfo.payerId = this.userId;
            payInfo.payerpayDate = new Date();
            payInfo.payerAddPoints = this.addPoints;
            payInfo.payerAddExpireDate = this.addExpireDate;
            payInfo.payerAddLevel = this.addLevel;

            console.log("payInfo为: ", payInfo);
            this.payRepository.save(payInfo);

            // 将支付成功的消息告诉前端
            // ... 


            return 'success';
        } else {
            // 签名验证失败，记录日志或采取其他措施
            console.error('签名不合法');
            return 'failure';
        }
    }

    // 主动查询支付结果
    public async queryPaymentStatus(payertradeId: string): Promise<object> {
        let payInfo = null;
        if (await this.elementExist('payertradeId', payertradeId)) {
            return {
                isSuccess: true,
                message: "用户已成功支付",
                data: await this.elementExist('payertradeId', payertradeId)
            }
        } else {
            return {
                isSuccess: false,
                message: "用户尚未成功支付"
            }
        }
    }
}
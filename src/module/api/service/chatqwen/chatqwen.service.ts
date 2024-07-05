import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { MeituautoService } from '../meituauto/meituauto.service';
import { paramsForApis } from 'src/others/paramsForApis';
import * as dotenv from 'dotenv';
dotenv.config();

// 数据库相关
import { InjectRepository } from '@nestjs/typeorm';
import { ParamsInfo } from 'src/entities/params.entity';
import { Repository } from 'typeorm';


@Injectable()
export class ChatqwenService {

    constructor(

        // 初始化数据库
        @InjectRepository(ParamsInfo)
        private readonly paramsRepository: Repository<ParamsInfo>,


        // 初始化服务
        private readonly meituautoService: MeituautoService,
        // private readonly meituautoParams: MeituAutoParams,
    ) { }

    // 引入参数列表
    private tools = paramsForApis;


    private async get_response(messages) {
        const api_key = process.env.QWEN_API_KEY;
        const url = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${api_key}`
        };
        const body = {
            'model': 'qwen-max-longcontext',
            "input": {
                "messages": messages
            },
            "parameters": {
                "result_format": "message",
                "tools": this.tools
            }
        }

        try {
            const response = await axios.post(url, body, { headers });
            return response.data;
        } catch (error) {
            console.error('发生错误', error);
        }



    }

    // 参数处理
    private async paramsProcess(responseParams, funcName: string, paramsTemplate: any) {

        // console.log("responseParams的值为", responseParams);

        let tool_call: any = {};

        // 查找指定funcName的tool_call，如果没有则给默认值
        if (responseParams && responseParams.tool_calls) {
            tool_call = responseParams.tool_calls.find(
                (tool_call) => tool_call.function.name === funcName
            )
        } else {
            tool_call = {
                "function": {
                    "name": funcName,
                    "arguments": JSON.stringify({
                        "properties": {}
                    }),
                }
            };
        }


        const responseArguments = JSON.parse(tool_call.function.arguments);

        // console.log("responseArguments的值为", responseArguments.properties);
        // console.log("paramsTemplate: ", paramsTemplate);

        const requiredParams: any = {};

        // 如果是美图智能API
        if (funcName === 'meituauto') {

            for (const key in paramsTemplate) {
                // console.log('key值为: ', responseArguments.properties );
                // console.log('key: ', key);
                // console.log('存在: ', responseArguments.properties.hasOwnProperty(key));


                // 检查responseArguments是否包含key
                if (responseArguments.properties.hasOwnProperty(key)) {


                    // 如果是滤镜属性，即key的名字为filter
                    if (key === 'filter') {
                        requiredParams[key] = responseArguments.properties[key];
                        console.log('requiredParams[key]: ', requiredParams[key]);
                        console.log('requiredParams: ', requiredParams);
                    }
                    //检查key是否为Array
                    else if (Array.isArray(paramsTemplate[key])) {
                        // console.log('key是数组: ', key);

                        // 数值合法性检验
                        if (Number(responseArguments.properties[key]) < -500 || Number(responseArguments.properties[key]) > 500) {
                            throw new Error('参数值必须在-500~500之间');
                        } else {
                            requiredParams[key] = [
                                Number(responseArguments.properties[key]),
                                Number(responseArguments.properties[key]),
                                Number(responseArguments.properties[key]),
                                Number(responseArguments.properties[key]),
                                Number(responseArguments.properties[key])
                            ]
                        }

                    } else {
                        // console.log('key是数字: ', key);
                        if (Number(responseArguments.properties[key]) < -500 || Number(responseArguments.properties[key]) > 500) {
                            throw new Error('参数值必须在-500~500之间');
                        } else {
                            requiredParams[key] = Number(responseArguments.properties[key]);
                        }
                    }
                }
            }

        }

        console.log("requiredParams: ", requiredParams);

        return requiredParams;

    }


    async txt2param(input_message: string, input_service: string) {

        //判断输入的service的值，来决定在后面给paramsProcess传入什么参数模板
        let paramsTemplate = {};
        if (input_service === 'meituauto') {
            paramsTemplate = this.meituautoService.publicParams;
        } else {
            throw new Error('chatqwen.service.ts中txt2param中，input_service值错误，无法与现有的API端匹配');
        }

        const message = [
            {
                "role": "system",
                "content": "你是一个生成图像处理所需参数的助手，不管用户输入什么自然语言，你都必须根据其话语中的意思，将这些话语通过function call功能返回给用户。即使用户描述的内容与图形处理毫无关系，你也必须使用function call格式随机选取一些参数给出一些适中的值返回。但如果用户描述了具体的要求，那么就返回所需的参数即可，其他参数不用返回。"
            }
        ]

        // 如果用户没有输入，则使用默认值
        if (input_message === '') {
            message.push(
                {
                    "role": "user",
                    "content": '简单优化一下'
                }
            )
        } else {
            message.push(
                {
                    "role": "user",
                    "content": input_message
                }
            )
        }

        //获取API端返回值
        const response = await this.get_response(message);
        console.log(response.output.choices[0].message.tool_calls);


        // console.log(' publicParams: ', this.meituautoService.publicParams);

        //处理API端返回参数并返回处理后的参数
        return await this.paramsProcess(response.output.choices[0].message, input_service, paramsTemplate);
    }




}

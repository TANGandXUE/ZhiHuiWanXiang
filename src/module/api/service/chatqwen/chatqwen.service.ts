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
            'model': 'qwen-plus',
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

            console.log('responseArguments: ', responseArguments);

            // responseArguments:  {
            //     properties: {
            //       filter: {
            //         filter_id: 'Fa5Ko6DFZ0M7LYq0',
            //         filters_lut_alpha: 50,
            //         filter_is_black: 0
            //       }
            //     }
            //   }

            for (const key in paramsTemplate) {
                // console.log('key值为: ', responseArguments.properties );
                // console.log('key: ', key);
                // console.log('存在: ', responseArguments.properties.hasOwnProperty(key));



                // 检查responseArguments是否包含key
                // PS: 由于阿里模型返回结果不稳定，有时候返回结果套了一层.properties，有时候是直接给里面的参数的，所以特此做一个是否存在properties的判定，如果没有的话，那就直接跳过这一层直接去里面的参数
                if (responseArguments.properties && responseArguments.properties.hasOwnProperty(key)) {


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


                } else if (responseArguments.hasOwnProperty(key)) {
                    // 如果是滤镜属性，即key的名字为filter
                    if (key === 'filter') {
                        requiredParams[key] = responseArguments[key];
                        console.log('requiredParams[key]: ', requiredParams[key]);
                        console.log('requiredParams: ', requiredParams);
                    }
                    //检查key是否为Array
                    else if (Array.isArray(paramsTemplate[key])) {
                        // console.log('key是数组: ', key);

                        // 数值合法性检验
                        if (Number(responseArguments[key]) < -500 || Number(responseArguments[key]) > 500) {
                            throw new Error('参数值必须在-500~500之间');
                        } else {
                            requiredParams[key] = [
                                Number(responseArguments[key]),
                                Number(responseArguments[key]),
                                Number(responseArguments[key]),
                                Number(responseArguments[key]),
                                Number(responseArguments[key])
                            ]
                        }

                    } else {
                        // console.log('key是数字: ', key);
                        if (Number(responseArguments[key]) < -500 || Number(responseArguments[key]) > 500) {
                            throw new Error('参数值必须在-500~500之间');
                        } else {
                            requiredParams[key] = Number(responseArguments[key]);
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
                "content": "你是一个生成图像处理所需参数的助手，不管用户输入什么自然语言，即使用户描述的内容与图形处理毫无关系，你都必须根据其话语中的意思，将这些话语，结合所有智能参数，通过function call功能返回给用户。这些智能参数包含：画质优化、色彩优化、美颜(美白、提亮)、瘦脸(缩小头部，减小脸宽)、肤色统一。这些智能参数，你要尽可能的选取一些返回，值不要太高，一点点就行。但如果用户描述了具体不要哪些功能，如用户描述了'不要瘦脸'，'不要美白'，那么就返回用户所需的参数以及其他智能参数即可。"
            }
        ]

        message.push(
            {
                "role": "user",
                "content": `智能白平衡(50)、脸部磨皮(25)、身体磨皮(25)、智能曝光(50)、背景增强(20)、智能美颜(50)、智能修复(20)、脸部宽度(narrow_face: -40)、肤色均匀(30)、皮肤美白透亮(20)、祛斑祛痘、智能去雾(5)。上面这些参数都返回给我。` + input_message
            }
        )

        //获取API端返回值
        const response = await this.get_response(message);
        console.log(response.output.choices[0].message.tool_calls);


        // console.log(' publicParams: ', this.meituautoService.publicParams);

        //处理API端返回参数并返回处理后的参数
        return await this.paramsProcess(response.output.choices[0].message, input_service, paramsTemplate);
    }




}

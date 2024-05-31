import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { MeituautoService } from '../meituauto/meituauto.service';




@Injectable()
export class ChatqwenService {

    constructor(
        private readonly meituautoService: MeituautoService,
        // private readonly meituautoParams: MeituAutoParams,
    ) { }

    private tools = [
        // 美图智能API
        {
            "type": "function",
            "function": {
                "name": "meituauto",
                "description": "当你想对图片作出调整时非常有用。能够提供如下效果：暗图矫正（改善图片角落/周围的暗色部分）、智能调节白平衡（改善发黄或发蓝的图像）、智能调节曝光（改善过亮或过暗的图像）、智能去雾（去除图片中灰蒙蒙的感觉）、智能美颜（让人更好看）、智能修复（改善照片中的模糊、低分辨率或老旧照片）",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "bright_low_dark_image_flag": {
                            "type": "string",
                            "description": "取值范围为0或者1，只有这两个结果。用于改善图片角落/周围的暗色部分，也就是暗图纠正。"
                        },
                        "awb_norm_coef": {
                            "type": "string",
                            "description": "取值范围为0~100，用于改善发黄或发蓝的图像，也就是智能白平衡调节"
                        },
                        "exposure_norm_coef": {
                            "type": "string",
                            "description": "取值范围为0~100，用于改善过亮或过暗的图像，也就是智能曝光调节。"
                        },
                        "dehaze_coef": {
                            "type": "string",
                            "description": "取值范围为0~100，用于去除图片中灰蒙蒙的感觉，也就是智能去雾。"
                        },
                        "face_beauty_alpha": {
                            "type": "string",
                            "description": "取值范围为0~100，用于让人更好看，也就是智能美颜。"
                        },
                        "face_restore_alpha": {
                            "type": "string",
                            "description": "取值范围为0~100，用于改善照片中的模糊、低分辨率或老旧照片，也就是智能修复。"
                        }
                    }
                },
                "required": []
            }
        },

        // 在此添加第二第三个工具
    ]


    private async get_response(messages) {
        const api_key = 'sk-81921fce54b345629de84818162f34ff';
        const url = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${api_key}`
        };
        const body = {
            'model': 'qwen-max',
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
    private paramsProcess(responseParams, funcName: string, paramsTemplate: any) {

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

        for (const key in paramsTemplate) {
            // console.log('key值为: ', responseArguments.properties );
            // console.log('key: ', key);
            // console.log('存在: ', responseArguments.properties.hasOwnProperty(key));


            // 检查responseArguments是否包含key
            if (responseArguments.properties.hasOwnProperty(key)) {
                //检查key是否为Array
                if (Array.isArray(paramsTemplate[key])) {
                    // console.log('key是数组: ', key);

                    // 数值合法性检验
                    if (Number(responseArguments.properties[key]) < 0 || Number(responseArguments.properties[key]) > 100) {
                        throw new Error('参数值必须在0~100之间');
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
                    if (Number(responseArguments.properties[key]) < 0 || Number(responseArguments.properties[key]) > 100) {
                        throw new Error('参数值必须在0~100之间');
                    } else {
                        requiredParams[key] = Number(responseArguments.properties[key]);
                    }
                }
            }
        }

        // console.log("requiredParams: ", requiredParams);
        return requiredParams;

    }


    async txt2param(input_message: string, input_service: string) {

        //判断输入的service的值，来决定在后面给paramsProcess传入什么参数模板
        let paramsTemplate = {};
        if(input_service === 'meituauto'){
            paramsTemplate = this.meituautoService.publicParams;
        }else{
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
        // console.log(response.output.choices[0].message);


        // console.log(' publicParams: ', this.meituautoService.publicParams);

        //处理API端返回参数并返回处理后的参数
        return await this.paramsProcess(response.output.choices[0].message, input_service, paramsTemplate);
    }




}

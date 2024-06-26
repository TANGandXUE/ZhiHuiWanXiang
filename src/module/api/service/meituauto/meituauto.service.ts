import axios from 'axios';
import { Injectable } from '@nestjs/common';

import * as dotenv from 'dotenv'; // .env相关
dotenv.config();  // .env相关

// MeituAuto最多查询次数
let maxQueryTimes = Number(process.env.MEITUAUTO_MAX_QUERY_COUNT || 30);
// meitu_auto发起任务间隔（毫秒）
let startProcessInterval = Number(process.env.MEITUAUTO_STARTPROCESS_INTERVAL || 1200);
// queryAsyncResult发起查询间隔（毫秒）
let queryInterval = Number(process.env.MEITUAUTO_QUERY_INTERVAL || 3000);
//错误信息汇总
let errorMessages: Array<string> = [];
// 用于存储msgId和fileName的对应关系
const msgIdToFileNameMap: Map<string, string> = new Map();

@Injectable()
export class MeituautoService {

    // 公开参数，即外部可以修改的参数
    public publicParams = {
        bright_low_dark_image_flag: 0,
        highpass_background_coef: 0,
        highpass_body_coef: 0,
        film_granularity: 0,
        awb_norm_coef: 0,
        exposure_norm_coef: 0,
        dehaze_coef: 0,
        radio: 0,
        face_beauty_alpha: [0, 0, 0, 0, 0],
        face_restore_alpha: [0, 0, 0, 0, 0],
    }


    private readonly apiKey = process.env.MEITUAUTO_APIKEY;
    private readonly apiSecret = process.env.MEITUAUTO_APISECRET;
    private readonly startProcessUrl = 'https://api.yunxiu.meitu.com/openapi/super_realphotolocal_async';
    private readonly queryUrl = 'https://api.yunxiu.meitu.com/openapi/query';

    private timerId: NodeJS.Timeout | null = null;

    private parameter = {};


    private async meitu_auto_startProcessSingle(fileInfo_url: { fileName: string, fileURL: string })
    // : Promise<{ isSuccess: Boolean, message: string, data: any }> 
    {
        const query = {
            api_key: this.apiKey,
            api_secret: this.apiSecret,
        };

        // 初始化请求体
        const body = {
            parameter: this.parameter,
            media_info_list: [{
                media_data: fileInfo_url.fileURL,
                media_profiles: {
                    media_data_type: 'url',
                    media_data_describe: 'src',
                },
            }],
        };

        try {
            const response = await axios.post(this.startProcessUrl, body, {
                params: query,
                headers: { 'Content-Type': 'application/json' },
            });

            console.log('meituauto_startProcessSingle方法内的response.data: ', response.data);
            return response.data.data.msg_id;
        } catch (error) {
            console.error(`Error processing image ${fileInfo_url.fileName}:`, error);
            errorMessages.push(`meituauto_startProcessSingle方法内，发起${fileInfo_url.fileName}的任务时出现异常。具体错误信息为：${error}`);
            throw error;
        }
    }



    private async queryAsyncResult(msgId): Promise<any> {
        console.log('目前正在查询的msgId为：', msgId);
        const requestConfig = {
            method: 'POST',
            url: this.queryUrl,
            data: {
                api_key: this.apiKey,
                api_secret: this.apiSecret,
                msg_id: msgId,
            },
            headers: {
                'Content-Type': 'application/json',
            },
        };

        try {
            const response = await axios(requestConfig);
            console.log('queryAsyncResult方法内的responseData: ', response.data)
            if (response.data.code === 29901 || response.data.code == 0) {
                return response.data;
            } else if (
                // 触发QPS限制
                response.data.code === 90024
            ) {
                return 90024;
            } else {
                const errorFileName = msgIdToFileNameMap.get(msgId);
                errorMessages.push(`queryAsyncResult方法内，查询${errorFileName}的任务时出现异常。错误代码为${response.data.code}，错误信息为：'${response.data.message}'`);
                throw new Error(`queryAsyncResult方法内，查询${errorFileName}的任务时出现异常。错误代码为${response.data.code}，错误信息为：'${response.data.message}'`);
            }

        } catch (error) {
            console.error('Error while querying async result:', error);
            throw error;

        }
    }


    //调用前两个方法，执行美图智能修图
    async meitu_auto(
        fileInfos_url_input: Array<{ fileName: string, fileURL: string }>,
        externalParams, // 外部传入的，用于修改初始参数的参数
        callback: (fileInfos_url_output, errorMessages: Array<string>) => void
    ) {

        //初始化错误列表
        errorMessages = [];

        //初始化参数相关逻辑
        this.parameter = {
            "repost_url": "https://httpbin.org/",
            "rsp_media_type": "url",
            "all_params": {
                "image_restoration": 0,
                "child_teeth_beauty_flag": 0,
                "temperature": 0,
                "hue": 0,
                "exposure": 0,
                "constrast": 0,
                "highlight": 0,
                "shadow": 0,
                "whiteness": 0,
                "blackness": 0,
                "sharpness": 0,
                "vibrance": 0,
                "saturability": 0,
                "hsl_hue_red": 0,
                "hsl_hue_orange": 0,
                "hsl_hue_yellow": 0,
                "hsl_hue_green": 0,
                "hsl_hue_aqua": 0,
                "hsl_hue_blue": 0,
                "hsl_hue_violet": 0,
                "hsl_hue_magenta": 0,
                "hsl_sat_red": 0,
                "hsl_sat_orange": 0,
                "hsl_sat_yellow": 0,
                "hsl_sat_green": 0,
                "hsl_sat_aqua": 0,
                "hsl_sat_blue": 0,
                "hsl_sat_violet": 0,
                "hsl_sat_magenta": 0,
                "hsl_luma_red": 0,
                "hsl_luma_orange": 0,
                "hsl_luma_yellow": 0,
                "hsl_luma_green": 0,
                "hsl_luma_aqua": 0,
                "hsl_luma_blue": 0,
                "hsl_luma_violet": 0,
                "hsl_luma_magenta": 0,
                "background_detain_alpha": 0,
                "id_photo_bg": 0,
                "id_photo_dpi": 0,
                "id_photo_size": 0,
                "film_granularity": 0,
                "mandible_left": [0, 0, 0, 0, 0],
                "mandible_right": [0, 0, 0, 0, 0],
                "flaw_clean_alpha": [0, 76, 100, 76, 0],
                "shiny_clean_alpha": [0, 59, 0, 0, 0],
                "inner_eye_corner_right": [0, 0, 0, 0, 0],
                "inner_eye_corner_left": [0, 0, 0, 0, 0],
                "eye_lid_left": [0, 0, 0, 0, 0],
                "eye_lid_right": [0, 0, 0, 0, 0],
                "lip_remove_alpha": [0, 44, 0, 0, 0],
                "eye_up_down_left": [0, 0, 0, 0, 0],
                "eye_up_down_right": [0, 0, 0, 0, 0],
                "nasal_root": [0, 0, 0, 0, 0],
                "fluffy_hair": [0, 0, 0, 0, 0],
                "threed_up_down": [0, 0, 0, 0, 0],
                "threed_left_right": [0, 0, 0, 0, 0],
                "sharpen_alpha": [0, 0, 0, 0, 0],
                "temple_left": [0, 0, 0, 0, 0],
                "temple_right": [0, 0, 0, 0, 0],
                "cheekbone_left": [0, 0, 0, 0, 0],
                "cheekbone_right": [0, 0, 0, 0, 0],
                "narrow_face_left": [0, 0, 0, 0, 0],
                "narrow_face_right": [0, 0, 0, 0, 0],
                "mandible": [0, 0, 0, 0, 0],
                "philtrum_warp": [0, 0, 0, 0, 0],
                "middle_half_of_face": [0, 0, 0, 0, 0],
                "bottom_half_of_face": [0, 0, 0, 0, 0],
                "mouth_smile": [0, 0, 0, 0, 0],
                "face_beauty_alpha": [0, 0, 0, 0, 0],
                "face_restore_alpha": [0, 0, 0, 0, 0],
                "wrinkle_forehead_removal_alpha": [90, 90, 80, 90, 90],
                "wrinkle_periorbital_removal_alpha": [90, 90, 65, 90, 90],
                "wrinkle_nasolabial_removal_alpha": [90, 90, 83, 90, 90],
                "wrinkle_cheek_removal_alpha": [90, 90, 57, 90, 90],
                "wrinkle_neck_removal_alpha": [90, 90, 100, 90, 90],
                "fleck_clean_flag": [0, 0, 0, 1, 1],
                "skin_fleck_clean_flag": [1, 1, 1, 1, 1],
                "nevus_removal_flag": [0, 0, 0, 0, 0],
                "remove_pouch": [0, 0, 0, 0, 0],
                "black_head_clean_flag": [0, 0, 0, 0, 0],
                "double_chin": [0, 0, 0, 0, 0],
                "white_teeth": [10, 10, 50, 10, 10],
                "teeth_beauty": [0, 0, 0, 0, 0],
                "face_balance_alpha": [0, 0, 0, 100, 100],
                "skin_balance_alpha": [100, 100, 48, 100, 100],
                "smooth_face_skin_alpha": [58, 45, 37, 20, 20],
                "smooth_not_face_skin_alpha": [49, 5, 65, 5, 5],
                "skin_hdr_alpha": [17, 21, 25, 21, 17],
                "skin_white_alpha": [11, 20, 20, 20, 11],
                "skin_red_alpha": [0, 0, 25, 0, 0],
                "ai_shrink_head": [0, 14, 10, 0, 0],
                "face_forehead": [0, 0, 0, 0, 0],
                "temple": [0, 0, 0, 0, 0],
                "cheekbone": [0, 0, 0, 0, 0],
                "narrow_face": [-20, -37, 0, -20, -20],
                "face_trans": [-16, -29, 0, -16, -16],
                "jaw_trans": [-44, -16, 0, -44, -44],
                "eye_trans": [0, 0, 0, 0, 0],
                "eye_height": [0, 0, 0, 0, 0],
                "eye_width": [0, 0, 0, 0, 0],
                "eye_distance": [0, 0, 0, 0, 0],
                "eye_tilt": [0, 0, 0, 0, 0],
                "eye_trans_left": [18, 55, 0, 18, 18],
                "eye_height_left": [14, 14, 0, 14, 14],
                "eye_width_left": [0, 0, 0, 0, 0],
                "eye_distance_left": [0, 0, 0, 0, 0],
                "eye_tilt_left": [0, 0, 0, 0, 0],
                "eye_trans_right": [18, 55, 0, 18, 18],
                "eye_height_right": [14, 14, 0, 14, 14],
                "eye_width_right": [0, 0, 0, 0, 0],
                "eye_distance_right": [0, 0, 0, 0, 0],
                "eye_tilt_right": [0, 0, 0, 0, 0],
                "scale_nose": [0, -17, 0, 0, 0],
                "nose_longer": [0, 0, 0, 0, 0],
                "shrink_nose": [-24, -29, 0, -24, -24],
                "bridge_nose": [0, 0, 0, 0, 0],
                "nasal_tip": [0, 0, 0, 0, 0],
                "mouth_trans": [-17, -17, 0, -17, -17],
                "upperlip_enhance": [0, 0, 0, 0, 0],
                "lowerlip_enhance": [0, 0, 0, 0, 0],
                "mouth_breadth": [-5, -15, 0, -15, -5],
                "mouth_high": [0, 0, 0, 0, 0],
                "high_mouth": [0, 0, 0, 0, 0],
                "eyebrow_height": [0, 0, 0, 0, 0],
                "eyebrow_tilt": [0, 0, 0, 0, 0],
                "eyebrow_distance": [0, 0, 0, 0, 0],
                "eyebrow_size": [0, 0, 0, 0, 0],
                "eyebrow_ridge": [0, 0, 0, 0, 0],
                "eyebrow_height_left": [0, 0, 0, 0, 0],
                "eyebrow_tilt_left": [0, 0, 0, 0, 0],
                "eyebrow_distance_left": [0, 0, 0, 0, 0],
                "eyebrow_size_left": [0, 0, 0, 0, 0],
                "eyebrow_ridge_left": [0, 0, 0, 0, 0],
                "eyebrow_height_right": [0, 0, 0, 0, 0],
                "eyebrow_tilt_right": [0, 0, 0, 0, 0],
                "eyebrow_distance_right": [0, 0, 0, 0, 0],
                "eyebrow_size_right": [0, 0, 0, 0, 0],
                "eyebrow_ridge_right": [0, 0, 0, 0, 0],
                "body_dullness_remove_alpha": [0, 0, 0, 0, 0],
                "multibody_beauty": [60, 60, 0, 60, 60],
                "type": 0,
                "type_slider": 0,
                "shrink_head": 5,
                "slim": 15,
                "lengthen": 5,
                "heighten": 0,
                "slim_leg": 20,
                "slim_waist": 20,
                "slim_hand": 15,
                "chest_enlarge": 15,
                "slim_hip": 5,
                "radio": 0,
                "dehaze_coef": 0,
                "awb_norm_coef": 0,
                "awb_pure_coef": 0,
                "exposure_norm_coef": 0,
                "exposure_pure_coef": 0,
                "bright_low_dark_image_flag": 0,
                "zoom_image_flag": 0,
                "super_resolution_alpha": 0,
                "denoise_skin_intensity_coef": 0,
                "denoise_intensity_coef": 0,
                "highpass_body_coef": 0,
                "highpass_background_coef": 0,
                "shadow_light": [30, 30, 30, 30, 30],
                "highlight_alpha": [28, 28, 0, 28, 28],
                "eyebrow_deepen": [14, 14, 0, 14, 14],
                "eyeshadow_deepen": [27, 27, 0, 27, 27],
                "lipstick_deepen": [31, 31, 0, 31, 31],
                "facial_deepen": [0, 0, 0, 0, 0],
                "bright_eye": [18, 18, 30, 18, 18],
                "shiny_clean": [0, 0, 0, 0, 0],
                "beauty_belly_alpha": [0, 1, 0, 0, 0],
                "eyebrow": [{
                    "id": "",
                    "color": "",
                    "alpha": 0
                }, {
                    "id": "",
                    "color": "",
                    "alpha": 0
                }, {
                    "id": "",
                    "color": "",
                    "alpha": 0
                }, {
                    "id": "",
                    "color": "",
                    "alpha": 0
                }, {
                    "id": "",
                    "color": "",
                    "alpha": 0
                }],
                "eyeshadow": [{
                    "id": "",
                    "color": "",
                    "alpha": 0
                }, {
                    "id": "",
                    "color": "0;0;0;0",
                    "alpha": 0
                }, {
                    "id": "",
                    "color": "",
                    "alpha": 0
                }, {
                    "id": "",
                    "color": "0;0;0;0",
                    "alpha": 0
                }, {
                    "id": "",
                    "color": "",
                    "alpha": 0
                }],
                "eye": [{
                    "id": "",
                    "color": "",
                    "alpha": 0
                }, {
                    "id": "",
                    "color": "0;0;0;0",
                    "alpha": 0
                }, {
                    "id": "",
                    "color": "",
                    "alpha": 0
                }, {
                    "id": "",
                    "color": "0;0;0;0",
                    "alpha": 0
                }, {
                    "id": "",
                    "color": "",
                    "alpha": 0
                }],
                "eyesocket": [{
                    "id": "",
                    "color": "",
                    "alpha": 0
                }, {
                    "id": "",
                    "color": "",
                    "alpha": 0
                }, {
                    "id": "",
                    "color": "",
                    "alpha": 0
                }, {
                    "id": "",
                    "color": "",
                    "alpha": 0
                }, {
                    "id": "",
                    "color": "",
                    "alpha": 0
                }],
                "eyelash": [{
                    "id": "",
                    "color": "",
                    "alpha": 0
                }, {
                    "id": "",
                    "color": "",
                    "alpha": 0
                }, {
                    "id": "",
                    "color": "",
                    "alpha": 0
                }, {
                    "id": "",
                    "color": "",
                    "alpha": 0
                }, {
                    "id": "",
                    "color": "",
                    "alpha": 0
                }],
                "feature": [{
                    "id": "",
                    "color": "",
                    "alpha": 0
                }, {
                    "id": "",
                    "color": "",
                    "alpha": 0
                }, {
                    "id": "",
                    "color": "",
                    "alpha": 0
                }, {
                    "id": "",
                    "color": "",
                    "alpha": 0
                }, {
                    "id": "",
                    "color": "",
                    "alpha": 0
                }],
                "blush": [{
                    "id": "",
                    "color": "",
                    "alpha": 0
                }, {
                    "id": "",
                    "color": "",
                    "alpha": 0
                }, {
                    "id": "",
                    "color": "",
                    "alpha": 0
                }, {
                    "id": "",
                    "color": "",
                    "alpha": 0
                }, {
                    "id": "",
                    "color": "",
                    "alpha": 0
                }],
                "mouth": [{
                    "id": "",
                    "color": "",
                    "alpha": 0
                }, {
                    "id": "",
                    "color": "0;0;0;0",
                    "alpha": 0
                }, {
                    "id": "",
                    "color": "",
                    "alpha": 0
                }, {
                    "id": "",
                    "color": "0;0;0;0",
                    "alpha": 0
                }, {
                    "id": "",
                    "color": "",
                    "alpha": 0
                }],
                "filter": {
                    "filter_id": "-1",
                    "filters_lut_alpha": 50,
                    "filter_is_black": 0
                },
                "id_photo": {
                    "id_photo_background_id": 0,
                    "id_photo_background_image": "",
                    "mode": 0,
                    "back_color": "",
                    "dst_back_color": "",
                    "back_mode": 0,
                    "back_change_slope": 1,
                    "back_change_bias": 1,
                    "layout": {
                        "width": 0,
                        "height": 0,
                        "unit": 0,
                        "dpi": 300,
                        "margin": 0,
                        "row": 0,
                        "col": 0,
                        "orient": 0
                    },
                    "standard": {
                        "width": 0,
                        "height": 0,
                        "unit": 0,
                        "dpi": 300
                    }
                }
            },
            "preview_size": 0,
            "req_mask_version": 0,
            "people_type": [{
                "key": "man",
                "gender": 1,
                "name": "男",
                "age": [15, 49]
            }, {
                "key": "woman",
                "gender": 0,
                "name": "女",
                "age": [15, 49]
            }, {
                "key": "child",
                "gender": 0,
                "name": "儿童",
                "age": [0, 14]
            }, {
                "key": "oldwoman",
                "gender": 0,
                "name": "老",
                "age": [50, 100]
            }, {
                "key": "oldman",
                "gender": 1,
                "name": "老",
                "age": [50, 100]
            }],
            "output": {
                "format": "jpg",
                "preview_size": 3000,
                "qualityKey": 12,
                "resize_height": 0,
                "resize_width": 0,
                "water_mark": 0
            }
        };
        Object.assign(this.parameter, externalParams);
        for (const key in externalParams) {
            if (externalParams.hasOwnProperty(key) && this.parameter.hasOwnProperty(key)) {
                this.parameter[key] = externalParams[key];
            }
        }


        const msgIds: string[] = [];
        const fileInfos_url_output: Array<{ fileName: string, fileURL: string }> = [];

        // console.log('执行到了1');

        // console.log('执行到了2');

        for (const fileInfo_url of fileInfos_url_input) {

            // console.log('执行到了3');

            // console.log('fileInfo: ', fileInfo_url);

            try {

                const msgId = await this.meitu_auto_startProcessSingle(fileInfo_url);

                // 将msgId和fileName对应起来
                msgIdToFileNameMap.set(msgId, fileInfo_url.fileName);

                // console.log('执行到了4');

                console.log('meitu_auto方法内的msgId: ', msgId);
                msgIds.push(msgId);
            } catch (error) {
                // 错误不处理，仅拦截，因为meitu_auto_startProcessSingle方法内已经处理过了
                // ...
            }

            //等待1.2秒再接着循环
            await new Promise(resolve => setTimeout(resolve, startProcessInterval));
        }

        let queryCount = 0; // 新增：查询次数计数器

        while (msgIds.length > 0 && queryCount < maxQueryTimes) {
            for (const msgId of msgIds.slice()) {


                try {

                    const responseData = await this.queryAsyncResult(msgId);

                    if (responseData === 90024) {
                        // 重新使用该msgId对应的fileInfo_url发起任务请求，然后push进msgIds中
                        console.log('msgIdToFileNameMap:', Array.from(msgIdToFileNameMap.entries()));
                        const fileInfo_url = fileInfos_url_input.find(fileInfo_url => fileInfo_url.fileName === msgIdToFileNameMap.get(msgId));
                        console.log('fileInfo_url: ', fileInfo_url);
                        const newMsgId = await this.meitu_auto_startProcessSingle(fileInfo_url);
                        msgIdToFileNameMap.set(newMsgId, fileInfo_url.fileName);
                        msgIds.splice(msgIds.indexOf(msgId), 1);
                        msgIds.push(newMsgId);
                        // console.log(`msgId ${msgId} 重新发起任务请求，新的msgId为${newMsgId}`);
                        // 等待1秒
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }

                    else if (responseData.code === 0) {
                        const originalFileName = msgIdToFileNameMap.get(msgId);
                        fileInfos_url_output.push(
                            {
                                fileName: `meituauto-${originalFileName}`,
                                fileURL: responseData.data.media_data,
                            }
                        )
                        msgIds.splice(msgIds.indexOf(msgId), 1);
                    }
                } catch (error) {
                    // 出错了也要移除这个msgId的检查，但要拦截错误，不要继续throw error了，否则会导致meitu_auto这个函数的返回值为错误，从而让外部拿不到任何结果
                    msgIds.splice(msgIds.indexOf(msgId), 1);
                    console.log('error为：', error);
                }
                console.log(`当前剩余msgIds长度：${msgIds.length}，已查询${queryCount}次`);

            }

            // 查询次数加1
            queryCount++;

            // 等待3秒后再检查一次
            await new Promise(resolve => setTimeout(resolve, queryInterval));
        }

        // 如果查询次数达到30次，直接返回
        if (queryCount >= maxQueryTimes) {
            console.log(`达到最大查询次数${maxQueryTimes}次，直接返回`);
            errorMessages.push('meitu_auto方法内，由于未知原因，查询已达到最大轮次');
        }

        if (errorMessages.length > 0) {
            console.log('meituauto内的errorMessages: ', errorMessages)
        }

        // 所有消息ID已处理完，调用回调函数
        callback(fileInfos_url_output, errorMessages);
    }




}
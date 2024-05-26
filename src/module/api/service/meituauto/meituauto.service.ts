import axios, { AxiosResponse } from 'axios';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MeituautoService {
  private readonly apiKey = 'c251dc04ac244dd29334cccd74c134be';
  private readonly apiSecret = '17026d72384d4adcae57dd0a81c7027c';
  private readonly startProcessUrl = 'https://api.yunxiu.meitu.com/openapi/super_realphotolocal_async';
  private readonly queryUrl = 'https://api.yunxiu.meitu.com/openapi/query';

//   private msgId: string; //暂时存储msgId

  private timerId: NodeJS.Timeout | null = null;

 private all_params = {
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
			"face_beauty_alpha": [58, 72, 61, 72, 58],
			"face_restore_alpha": [80, 80, 99, 80, 80],
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


    async meitu_auto_startProcessSingle(fileInfo: { fileName: string, fileURL: string }): Promise<string> {
        const query = {
        api_key: this.apiKey,
        api_secret: this.apiSecret,
        };

        const body = {
        parameter: this.all_params,
        media_info_list: [{
            media_data: fileInfo.fileURL,
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

        return response.data.data.msg_id;
        } catch (error) {
        console.error(`Error processing image ${fileInfo.fileName}:`, error);
        throw error;
        }
    }



  async queryAsyncResult(msgId): Promise<AxiosResponse<any>> {
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
      return response;
    } catch (error) {
      console.error('Error while querying async result:', error);
      throw error;
    }
  }



  async meitu_auto(fileInfos_url_input: Array<{ fileName: string, fileURL: string }>, callback: (result: AxiosResponse<any>[]) => void): Promise<void> {
    try {
      const fileInfos_url = fileInfos_url_input.slice(); // 创建文件信息副本，避免原数组被修改
      let msgIds: string[] = [];
      let responses: AxiosResponse<any>[] = [];
      let completedCount = 0;

      const processNext = async () => {
        if (completedCount >= fileInfos_url.length) {
          // 所有文件处理完成，调用回调并停止定时器
          callback(responses);
          clearTimeout(this.timerId);
          this.timerId = null;
          return;
        }

        const fileInfo = fileInfos_url[completedCount];
        const msgId = await this.meitu_auto_startProcessSingle(fileInfo);
        msgIds.push(msgId);
        console.log(`Started processing file ${fileInfo.fileName} with msgId ${msgId}`);

        const queryResult = async (msgId: string) => {
          let response: AxiosResponse<any>;
          do {
            response = await this.queryAsyncResult(msgId);
            if (response.data.code !== 0) {
              console.log(`Task for file ${fileInfo.fileName} is not finished yet:`, response.data);
              await new Promise(resolve => setTimeout(resolve, 3000));
            }
          } while (response.data.code !== 0);

          responses.push(response);
          completedCount++;
          processNext();
        };

        // 开始查询，不等待查询结果
        queryResult(msgId);
        
        // 等待1秒后处理下一个文件
        this.timerId = setTimeout(processNext, 1000);
      };

      // 开始处理第一个文件
      processNext();
    } catch (error) {
      console.error('Error processing images:', error);
      throw error;
    }
  }

}
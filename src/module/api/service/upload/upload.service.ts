import { Injectable, HttpException } from '@nestjs/common';
import { AxiosError, AxiosResponse } from 'axios';
import * as axios from 'axios';
import * as fs from 'fs';

@Injectable()
export class UploadService {

  async meitu_filter(apiKey: string, secretKey: string, imagePaths: string[], filterParams: any): Promise<any> {
    try {

      // console.log("ImagePaths：", imagePaths)

      // console.log("实参为：", filterParams, imagePaths)
      // 处理每个图片路径，构建请求体
      const requestBody = {
        media_info_list: imagePaths.map((imagePath) => {
          const image = fs.readFileSync(imagePath, { encoding: 'base64' });
          const mediaData = image; // 直接使用读取到的Base64字符串，无需添加头部

          return {
            media_data: mediaData,
            media_profiles: {
              media_data_type: 'jpg',
            },
          };
        }),
        parameter: filterParams,
      };

      // console.log("这里执行到了");
      // console.log("请求体为：", requestBody);

      // 发起 POST 请求
      const url = `https://openapi.mtlab.meitu.com/v1/filter?api_key=${apiKey}&api_secret=${secretKey}`;
      const response: AxiosResponse = await axios.default.post(url, requestBody, {
        headers: { 'Content-Type': 'application/json' },
      });

      return {
        statusCode: response.status,
        data: response.data,
      };
    } catch (error) {
        // console.error("error为：", error);
        const axiosError = error as AxiosError;
        if (axiosError.response) {
          throw new HttpException({
            statusCode: axiosError.response.status,
            message: axiosError.response.data,
            data: axiosError.response.data,
          }, axiosError.response.status);
        } else {
          throw new HttpException({
            statusCode: 500,
            message: error.message,
          }, 500);
        }
    }
  }

  
}
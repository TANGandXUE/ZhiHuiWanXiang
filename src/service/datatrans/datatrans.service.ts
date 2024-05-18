import { Injectable } from '@nestjs/common';
import * as sharp from 'sharp';
import * as fs from 'fs';
import * as http from 'http';

@Injectable()
export class DatatransService {

    //输入包含media_data属性的base64编码信息，返回包含media_data属性的file对象
    async base64toFile(base64_info_list) {
        const promises = base64_info_list.map(async (base64_info) => {
            if (base64_info.media_data) {
                const image_buffer = Buffer.from(base64_info.media_data.replace(/^data:image\/\w+;base64,/, ''), 'base64');
                try {
                    const imageBuffer = await sharp(image_buffer)
                        .toFormat('jpeg')
                        .toBuffer();
                    return imageBuffer;
                } catch (error) {
                    console.error('Error processing image:', error);
                }
            }
        });

        const buffer_list = await Promise.all(promises);
        return buffer_list;
    }


    //将windows路径转换为linux路径
    convertWindowsSlashes(windowsPathArray: string[]): string[] {
        return windowsPathArray.map(path => path.replace(/\\/g, '/'));
    }



    // 将包含URL的fileInfos下载到本地，返回包含本地路径的localFileInfos
    async urlToLocal(fileInfos_url: Array<{ fileName: string, fileURL: string }>, fileType: string): Promise<Array<{ fileName: string; filePath: string }>> {

        const downloadDir = 'public/user/download/';
        // 确保下载目录存在
        if (!fs.existsSync(downloadDir)) {
            fs.mkdirSync(downloadDir, { recursive: true });
        }

        // 创建一个下载并保存文件的Promise数组
        const downloadPromises = fileInfos_url.map(async ({ fileName, fileURL: fileUrl }) => {
            const localFilePath = `${downloadDir}${fileName}.${fileType}`;

            return new Promise<{ fileName: string; filePath: string }>((resolve, reject) => {
            const file = fs.createWriteStream(localFilePath);
            http.get(fileUrl, (response) => {
                response.pipe(file);

                file.on('finish', () => {
                file.close();
                resolve({ fileName: `${fileName}.${fileType}`, filePath: localFilePath });
                });
            }).on('error', (err) => {
                fs.unlink(localFilePath, () => { }); // 删除已开始下载但未完成的文件
                reject(err);
            });
            });
        });

        try {
            // 等待所有文件下载完成
            const localFileInfos = await Promise.all(downloadPromises);
            return localFileInfos;
        } catch (error) {
            console.error('下载过程中发生错误:', error);
            throw error; // 重新抛出错误，可以选择处理或直接抛给调用者
        }
    }





    

}
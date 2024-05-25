import { Injectable } from '@nestjs/common';
import * as sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { promisify } from 'util';
const CloudConvert = require('cloudconvert');
const fsUnlink = promisify(fs.unlink);

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

    // fileInfos(含URL)转换成fileInfos(含本地路径)
    async urlToLocal(fileInfos_url: Array<{ fileName: string, fileURL: string }>, fileType: string): Promise<Array<{ fileName: string; filePath: string }>> {
        const downloadDir = 'public/user/download/';
        // 确保下载目录存在
        if (!fs.existsSync(downloadDir)) {
            fs.mkdirSync(downloadDir, { recursive: true });
        }

        const downloadPromises = fileInfos_url.map(async ({ fileName, fileURL }) => {
            // 提取文件名和扩展名
            const baseNameWithoutExt = path.basename(fileName, path.extname(fileName));
            const localFilePath = path.join(downloadDir, `${baseNameWithoutExt}.${fileType}`);

            try {
                const response = await axios({
                    method: 'GET',
                    url: fileURL,
                    responseType: 'stream',
                    maxRedirects: 5, // 可以调整重定向的最大次数
                });

                const file = fs.createWriteStream(localFilePath);

                response.data.pipe(file);

                await new Promise((resolve) => {
                    file.on('finish', () => {
                        file.close(resolve);
                    });
                });

                return { fileName, filePath: localFilePath };
            } catch (error) {
                await fsUnlink(localFilePath); // 删除已开始下载但未完成的文件
                throw error;
            }
        });

        try {
            const localFileInfos = await Promise.all(downloadPromises);
            console.log('localFileInfos: ', localFileInfos);
            return localFileInfos;
        } catch (error) {
            console.error('下载过程中发生错误:', error);
            throw error;
        }
    }


    //识别图像类型并转换为png格式
    async convertToPng(fileInfos: Array<{ fileName: string, filePath: string }>): Promise<{ resultFileName: string, resultFilePath: string }[]> {
        const result: Array<{ resultFileName: string, resultFilePath: string }> = [];

        // 使用Promise.all并行处理所有文件转换
        await Promise.all(fileInfos.map(async (fileInfo) => {
            const { fileName, filePath } = fileInfo;
            // 检查文件是否为非png格式
            if (!fileName.toLowerCase().endsWith('.png')) {
                // 构建新的文件名和路径
                const fileExt = fileName.split('.').pop();
                console.log('fileExt: ', fileExt);
                const newFileName = `${fileName.slice(0, -fileExt.length - 1)}.png`;
                console.log('newFileName: ', newFileName);
                const newFilePath = filePath.replace(/\.([a-z]+)$/i, '.png');
                console.log('newFilePath: ', newFilePath);

                try {
                    // 使用sharp转换图像格式
                    await sharp(filePath)
                        .toFormat('png')
                        .toFile(newFilePath);

                    // 将转换后的信息存入结果数组
                    result.push({ resultFileName: newFileName, resultFilePath: newFilePath });
                } catch (error) {
                    console.error(`转换文件${filePath}时出错：`, error);
                }
            } else {
                result.push({ resultFileName: fileName, resultFilePath: filePath });
            }

        }));

        return result; // 所有文件转换完成后返回结果数组
    }


    cloudConvert = new CloudConvert('eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiNTA5ZjhmZDhkMjVmN2YzNTc2YWZkNjBiZmYwOGE0NTYxNmFhNDAyODZhYTM5OWZlMTBkYzY2ZDhkNGU5Y2VkMDI5YmFmMjE3YzllYzEyOWEiLCJpYXQiOjE3MTYxNzc5MTcuMjA2MiwibmJmIjoxNzE2MTc3OTE3LjIwNjIwMiwiZXhwIjo0ODcxODUxNTE3LjIwMzIzNCwic3ViIjoiNjg0MTkzMTEiLCJzY29wZXMiOlsidXNlci5yZWFkIiwidXNlci53cml0ZSIsInRhc2sucmVhZCIsInRhc2sud3JpdGUiLCJ3ZWJob29rLnJlYWQiLCJ3ZWJob29rLndyaXRlIiwicHJlc2V0LnJlYWQiLCJwcmVzZXQud3JpdGUiXX0.RX90sIOhzMfw-NZfuU64REH8vTvWvh8Npe_HswC8vnNkIKe42kMaZKm3T3eIJWLCAiEFVlKdzSuQXT7PJ3WLgBQe2Q1EuYt504DT3oanStAownQhnirU4IX02Ls94t1nBVVwoVcdN-sA1FyzcTbPi6JV_NQJeKqEcR9UxWuDUAbKcZTc_3MZRY-SKGoJOBnPgH5WN7TBrZ42XmhnCk__g3PK4zM2vM6yKSvkC9hHdWECSk4srXy08yRVpEt1xJ8rlcZ-DR5mDtsrB-Dcy73sS1gdHRKJhRQHKjUc5AeJqG6EBHzYIwLlttl8wuc3a2jfJpEKKN1l407gNFg7XZF14pymfwo_k_AZaKudmNi_S4qgKCue7duQ-A7roRMGbKlDbCQvEzh5Em3--pEs1Ym7V6TE8hJvGw0FMEoylj49Af21GmwLXvNil_XZAqea0LbeNxeGIEZ5iEiPD98a6nAc5x5n3U6gm24lCyjjb_1hJeJD-zhfop8wJUzGoefWUGcvDnqctjU5p9dsI2nSksnRxIT4K94s1ZaIu-813QWyh40MmJDZdyGsgbssAY7PEhPjOJ8XIbf9WSWkC9K3T--f56HDV91V4Dof4QETanRKlHg5aiM7Xn-rHuU3msX9_NpYMSk-cDyZLrZUd7r029jEaKq2kKhmh66IVLC7y9-bWIA');

    
    async img2img(fileInfos_url: Array<{ fileName: string, fileURL: string }>, params: { outputFormat: string, quality: number }) {


        // 创建一个用于存储所有job promise的数组
        const jobPromises = fileInfos_url.map(async (fileInfo_url) => {
            console.log('拓展名为：', path.extname(fileInfo_url.fileName).toLowerCase());
            console.log({
                a: path.extname(fileInfo_url.fileName).toLowerCase().substring(1),
                b: params.outputFormat,
                c: params.quality,
            });

            const job = await this.cloudConvert.jobs.create({
                tasks: {
                    importFile: {
                        operation:      "import/url",
                        url:            fileInfo_url.fileURL,
                    },
                    convertFile: {
                        operation:      "convert",
                        input_format:   path.extname(fileInfo_url.fileName).toLowerCase().substring(1),
                        output_format:  params.outputFormat,
                        engine:         "imagemagick",
                        input:          "importFile",
                        fit:            "max",
                        strip:          false,
                        quality:        params.quality,
                    },
                    exportFile: {
                        operation:      "export/url",
                        input:          "convertFile",
                        inline:         true,
                        archive_multiple_files: false,
                    },
                },
            });

            console.log('job已上传');

            // 返回一个代表job完成并获取exportUrl的promise
            return { jobId: job.id, fileInfo_url };
        });

        // 使用Promise.all等待所有job创建完成
        const jobInfoArray = await Promise.all(jobPromises);

        // 对于每个job，启动一个异步操作来等待其完成并获取URL，不阻塞
        const resultPromises = jobInfoArray.map(async ({ jobId, fileInfo_url }) => {
            try {
                const job = await this.cloudConvert.jobs.wait(jobId);
                if (job.status === 'error') {
                    throw new Error(`Job ${jobId} failed`);
                }
                const resultFile = this.cloudConvert.jobs.getExportUrls(job)[0];
                const resultFileName = `${fileInfo_url.fileName.substring(0, fileInfo_url.fileName.lastIndexOf('.'))}.${params.outputFormat}`;
                return { fileName: resultFileName, fileURL: resultFile.url };
            } catch (error) {
                console.error(`Job ${jobId} failed: ${error.message}`);
                // 可以选择抛出错误或处理它，这里为了简单直接忽略了错误
            }
        });

        // 等待所有结果处理完成
        const result_urls = await Promise.all(resultPromises);

        return result_urls;
    }


}
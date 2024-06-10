import { Injectable } from '@nestjs/common';
import * as sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { promisify } from 'util';
const CloudConvert = require('cloudconvert');
const fsUnlink = promisify(fs.unlink);
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class DatatransService {

    //输入包含media_data属性的base64编码信息，返回包含media_data属性的file对象
    async base64toFile(base64_info_list) {

        console.log('base64_info_ilst: ', base64_info_list);
        
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


    // 将fileInfos(含本地路径)转换成fileInfos(含base64编码)
    async filetoBase64(fileInfos: Array<{ fileName: string, filePath: string }>){
        const fileInfos_base64 = fileInfos.map(async (fileInfo) => {
            const buffer = await fs.readFileSync(fileInfo.filePath);

            let contentType: any;

            if(fileInfo.fileName.split('.').pop() === 'jpg'){
                contentType = 'image/jpeg';
            } else {
                contentType = `image/${fileInfo.fileName.split('.').pop()}`;
            }

            return {
                fileName: fileInfo.fileName,
                contentType,
                fileBase64: buffer.toString('base64'),
            }
        })

        return await Promise.all(fileInfos_base64);
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

            console.log('本地文件路径为: ', localFilePath);

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


    cloudConvert = new CloudConvert(process.env.CLOUDCONVERT_KEY);

    
    async img2img(fileInfos_url: Array<{ fileName: string, fileURL: string }>, params: { outputFormat: string, quality: number }) {


        // 创建一个用于存储所有job promise的数组
        const jobPromises = fileInfos_url.map(async (fileInfo_url) => {
            console.log('拓展名为：', path.extname(fileInfo_url.fileName).toLowerCase());
            console.log({
                a: path.extname(fileInfo_url.fileName).toLowerCase().substring(1),
                b: params.outputFormat,
                c: params.quality,
            });

            //如果输入拓展名和输出的一样，则随便定义一个固定的jobID，直接返回
            if (path.extname(fileInfo_url.fileName).toLowerCase().substring(1) === params.outputFormat) {
                return { jobId: 100100100, fileInfo_url };
            };

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

            //如果jobId是我随便定义的那个，那么直接返回
            if (jobId === 100100100) {
                return { 
                    fileName: fileInfo_url.fileName,
                    fileURL: fileInfo_url.fileURL 
                };
            }

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
        // console.log("result_urls这里执行到了");

        return result_urls;
    }


}
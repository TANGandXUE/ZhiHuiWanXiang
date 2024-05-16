import { Injectable } from '@nestjs/common';
import * as OSS from 'ali-oss';
import { promisify } from 'util'; // 引入promisify用于转换异步回调函数为Promise
const writeFile = promisify(require('fs').writeFile); // 将writeFile转换为Promise版本

@Injectable()
export class OssService {

    

    //上传文件到OSS
    async uploadFiles(fileInfos: Array<{ fileName: string, filePath: string }>){
        try {
                for(const fileInfo of fileInfos){
                    // 上传文件到OSS，'object'是OSS中的文件名，'localfile'是本地文件的路径。
                    const uploadResult = await this.client.put(fileInfo.fileName, fileInfo.filePath);
                    console.log('上传文件到OSS成功:', uploadResult);
                }
            } 
            catch (error) 
            {
                console.error('上传文件到OSS错误:', error);
                // 在此处添加错误处理逻辑。
            }
    }

    // 从OSS下载文件
    async downloadFiles(fileInfos: Array<{ fileName: string }>){

        const downloadFileInfos: Array<{ fileName: string, localFilePath: string }> = []; // 创建存储文件信息的数组

        try 
        {
            for(const fileInfo of fileInfos){
                // 从OSS下载文件以验证上传成功。
                const getResult = await this.client.get(fileInfo.fileName);
                // console.log('从OSS下载文件成功，Tag为: ', getResult.res.headers.etag);
                // console.log('从OSS下载文件成功，buffer为: ', getResult.res.data);

                const currentDate = new Date().toISOString().split('T')[0].replace(/-/g, '-');
                const localFilePath = `public/sql/oss/${currentDate}-${fileInfo.fileName}.jpeg`;

                // 将Buffer写入到本地文件
                await writeFile(localFilePath, getResult.res.data, 'binary');
                // console.log(`文件已保存至: ${localFilePath}`);

                 // 文件写入成功后，将信息添加到数组
                downloadFileInfos.push({ fileName: fileInfo.fileName, localFilePath });

            }
        }
        catch (error) 
        {
            console.error('从OSS下载文件错误:', error);
            // 在此处添加错误处理逻辑。
        }

        return downloadFileInfos;
    }

}

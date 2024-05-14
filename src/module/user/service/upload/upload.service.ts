import { Injectable } from '@nestjs/common';
import { createWriteStream } from 'fs';
import { join } from 'path';
// import { fileTypeFromFile } from 'file-type'; // 引入file-type库来检测文件类型

// // 动态引入 file-type 库
// const fileTypeFromFile = async (filePath: string) => {
//     const { fileTypeFromFile } = await import('file-type');
//     return fileTypeFromFile(filePath);
// };

@Injectable()
export class UploadService {

    private fileInfos: Array<{ fileName: string, filePath: string }> = [];

    // 写入文件并返回文件信息
    writeFiles(files): Array<{ fileName: string, filePath: string }> {

        for (const file of files) {
            const filePath = join(__dirname, '../../../../../public/user/upload', `${Date.now()}-${file.originalname}`);

            console.log(file.originalname + ' ' + filePath)

            var writeStream = createWriteStream(filePath);
            writeStream.write(file.buffer);
            this.fileInfos.push({ fileName: file.originalname, filePath });
        }

        return this.fileInfos;
    }
}
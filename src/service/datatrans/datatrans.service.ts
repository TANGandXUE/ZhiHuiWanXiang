import { Injectable } from '@nestjs/common';
import * as sharp from 'sharp';

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


}
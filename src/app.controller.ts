import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { DatatransService } from './service/datatrans/datatrans.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly datatransService: DatatransService

  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test-filetobase64')
  async filetobase64(){
    console.log( await this.datatransService.filetoBase64(
      [
        {
        fileName: 'meituauto-4-1.jpg',
        filePath: 'public\\user\\download\\meituauto-4-1.jpg' 
        }
      ]
    ))
  }
}

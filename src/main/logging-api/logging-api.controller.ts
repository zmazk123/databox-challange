import { Controller, Get, Param } from '@nestjs/common';
import { LoggingApiService } from './logging-api.service';
import { MainApiReponse } from '../main-api/main-api.entity';
import { LoggingApiDto } from './logging-api.dto';


@Controller("logger")
export class LoggingApiController {
  constructor(private readonly loggingApiService: LoggingApiService) {}

  @Get()
  async findAllMainApiResponses(): Promise<MainApiReponse[]> {
    return this.loggingApiService.findAllMainApiResponses()
  }

  @Get(':id')
  async findMainApiResponseById(@Param() params: LoggingApiDto): Promise<MainApiReponse> {
    return this.loggingApiService.findMainApiResponseById(params.id)
  }
}
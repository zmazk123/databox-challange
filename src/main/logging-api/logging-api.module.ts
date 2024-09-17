import { Module } from '@nestjs/common';
import { LoggingApiController } from './logging-api.controller';
import { LoggingApiService } from './logging-api.service';
import { MainApiModule } from '../main-api/main-api.module';

@Module({
    imports: [MainApiModule],
    controllers: [LoggingApiController],
    providers: [LoggingApiService],
    exports: []
  })
export class LoggingApiModule {}

import { Module } from '@nestjs/common';
import { OpenmeteoService } from './openmeteo.service';

@Module({
    providers: [OpenmeteoService],
    exports: [OpenmeteoService]
  })
export class OpenmeteoModule {}

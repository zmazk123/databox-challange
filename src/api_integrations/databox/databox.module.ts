import { Module } from '@nestjs/common';
import { DataboxService } from './databox.service';

@Module({
  providers: [DataboxService],
  exports: [DataboxService]
})
export class DataboxModule {}

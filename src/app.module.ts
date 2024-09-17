import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { MainApiModule } from './main/main-api/main-api.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggingApiModule } from './main/logging-api/logging-api.module';
import { configDb } from './typeorm'
import { DataSourceOptions } from 'typeorm';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [ConfigModule.forRoot({isGlobal: true}), MainApiModule, LoggingApiModule, ScheduleModule.forRoot(),
    TypeOrmModule.forRoot(configDb as DataSourceOptions),
  ],
})
export class AppModule {}

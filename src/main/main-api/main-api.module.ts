import { Module } from '@nestjs/common';
import { DataboxModule } from 'src/api_integrations/databox/databox.module';
import { MainApiController } from './main-api.controller';
import { MainApiService } from './main-api.service';
import { OpenmeteoModule } from 'src/api_integrations/source_apis/openmeteo/openmeteo.module';
import { GithubModule } from 'src/api_integrations/source_apis/github/github.module';
import { MainApiReponse } from './main-api.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [DataboxModule, OpenmeteoModule, GithubModule, TypeOrmModule.forFeature([MainApiReponse])],
    controllers: [MainApiController],
    providers: [MainApiService],
    exports: [TypeOrmModule]
  })
export class MainApiModule {}

import { Module } from '@nestjs/common';
import { GithubService } from './github.service';
import { HttpModule } from '@nestjs/axios';
import { GithubAuthService } from './github.auth-service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessToken } from './github.auth-service.entity';

@Module({
    imports: [HttpModule, TypeOrmModule.forFeature([AccessToken])],
    providers: [GithubService, GithubAuthService],
    exports: [GithubService]
  })
export class GithubModule {}

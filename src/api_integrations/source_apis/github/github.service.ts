import { Injectable } from '@nestjs/common';
import { GithubAuthService } from './github.auth-service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccessToken } from './github.auth-service.entity';
import { AxiosRequestConfig } from 'axios';
import { lastValueFrom, map } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { PushData } from 'databox';

@Injectable()
export class GithubService {
    constructor(
        private readonly githubAuthService: GithubAuthService,
        @InjectRepository(AccessToken)
        private accessTokenRepository: Repository<AccessToken>,
        private readonly httpService: HttpService,
    ) {}

    //tokens here should match metric token on the databox platform
    //can we do this in a better way???
    private readonly metricTokens: string[] = ["subscribers", "commits"]; 

    //These HTTP call functions should be moved to a seperate "helper or utils" module
    private async makeAxiosGetRequest(url: string, requestConfig: AxiosRequestConfig): Promise<any>{
        let res = await lastValueFrom(this.httpService.get(url, requestConfig).pipe(map(resp => resp.data)))

        return res
    }

    private getTokenFromDatabase(): Promise<AccessToken[]>{
        return this.accessTokenRepository.find({order: { id: 'DESC' }, skip:0, take:1,})
    }

    async startAuthProcess(): Promise<boolean> {
        try{
            await this.githubAuthService.deviceFlow()
        }
        catch{
            return false
        }
        return true
    }

    private async getMetric(accessToken: string, metricToken: string): Promise<PushData>{
        const requestConfig: AxiosRequestConfig = {
            headers:{
                Accept: "application/vnd.github+json",
                Authorization: "Bearer " + accessToken,
                "X-GitHub-Api-Version": "2022-11-28"
            },
        };

        //hardcoded to my repo...
        const response: JSON = await this.makeAxiosGetRequest(process.env.GITHUB_API_URL+"repos/zmazk123/GAN_Illumination/" + metricToken, requestConfig)
        
        const metric: number = JSON.parse(JSON.stringify(response)).length

        const pushData: PushData = {
            key: metricToken,
            value: metric,
        }

        console.log("Retreived " + metricToken + " from Github: " + metric)

        return pushData
    }

    async getAllMetrics(): Promise<PushData[]> {
        let accessTokenDatabaseResponse: AccessToken[] = null
        try{
            accessTokenDatabaseResponse = await this.getTokenFromDatabase();
            if(accessTokenDatabaseResponse.length === 0){
            
                //if no token exists automatically trigger device flow
                await this.githubAuthService.deviceFlow()
                accessTokenDatabaseResponse = await this.getTokenFromDatabase();
            }
        }
        catch{
            throw "Unable to obtain access token"
        }
        const accessToken: string = accessTokenDatabaseResponse[0].accessToken

        const responseSettleResults = await Promise.allSettled(this.metricTokens.map((token) => this.getMetric(accessToken, token)))

        let metrics: PushData[] = [];
        for (let [i, result] of responseSettleResults.entries()) {
            if(result.status === "fulfilled"){
                metrics[i] = result.value
            }  
            if(result.status === "rejected"){
                metrics[i] = undefined
            }
        }

        return metrics
    }
}
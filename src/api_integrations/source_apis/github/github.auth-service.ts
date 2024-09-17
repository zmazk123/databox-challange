import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom, map } from 'rxjs';
import { AxiosRequestConfig } from 'axios';
import { DeviceFlowStepOneResponse } from './device_flow_responses/step-one.response';
import { DeviceFlowStepTwoResponse } from './device_flow_responses/step-two.response';
import { AccessToken } from './github.auth-service.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class GithubAuthService {
    constructor(
        private readonly httpService: HttpService,
        @InjectRepository(AccessToken)
        private accessTokenRepository: Repository<AccessToken>,
    ) {}
    
    private async makeAxiosPostRequest(url: string, requestConfig: AxiosRequestConfig): Promise<any>{
        let res = await lastValueFrom(this.httpService.post(url, null, requestConfig).pipe(map(resp => resp.data)))

        return res
    }

    private async deleteAllAccessTokens(): Promise<void>{
        const accessTokens = await this.accessTokenRepository.find()
        accessTokens.forEach(token => {
            this.accessTokenRepository.delete(token.id)
        });
    }

    async deviceFlow(): Promise<void>{
        const requestConfigStep1: AxiosRequestConfig = {
            headers:{Accept: "application/json"},
            params: {client_id: process.env.GITHUB_CLIENT_ID}
        };
          
        const responseStepOne: DeviceFlowStepOneResponse = await this.makeAxiosPostRequest(process.env.GITHUB_DEVICE_FLOW_URL+"login/device/code", requestConfigStep1)

        const requestConfigStep2: AxiosRequestConfig = {
            headers:{Accept: "application/json"},
            params: {
                client_id: process.env.GITHUB_CLIENT_ID,
                device_code: responseStepOne.device_code,
                grant_type: "urn:ietf:params:oauth:grant-type:device_code"
            }
        };

        /*
        Polling loop. We need to periodically
        poll GitHub to see if the user entered the code.
        Of course this should be done in a more robust way irl.
        */
        let responseStep2: DeviceFlowStepTwoResponse = await this.makeAxiosPostRequest(process.env.GITHUB_DEVICE_FLOW_URL+"login/oauth/access_token", requestConfigStep2)

        for (let i = 0; i < 50; i++) {
            
            if (responseStep2.hasOwnProperty("access_token")) {
                break
            }
            console.log("Please goto: " + responseStepOne.verification_uri + " and input code: " + responseStepOne.user_code + ", Poll no:" + i)
            await new Promise(f => setTimeout(f, 5000)); //we need to wait 5s before making next poll

            responseStep2 = await this.makeAxiosPostRequest(process.env.GITHUB_DEVICE_FLOW_URL+"login/oauth/access_token", requestConfigStep2)
        }

        if (!responseStep2.hasOwnProperty("access_token")) {
            throw "Error"
        }

        await this.deleteAllAccessTokens()
        await this.accessTokenRepository.insert({accessToken: responseStep2.access_token})
    }
}
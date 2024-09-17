import { Injectable } from '@nestjs/common';
import { DataboxService } from 'src/api_integrations/databox/databox.service';
import { DataPostRequest, PushData } from "databox";
import { MainApiReponse } from './main-api.entity';
import { OpenmeteoService } from 'src/api_integrations/source_apis/openmeteo/openmeteo.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { GithubService } from 'src/api_integrations/source_apis/github/github.service';

@Injectable()
export class MainApiService {
  constructor(
    private databoxService: DataboxService,
    private openmeteoService: OpenmeteoService,
    private githubService: GithubService,
    @InjectRepository(MainApiReponse)
    private mainApiResponseRepository: Repository<MainApiReponse>,
  ) {}

  //TODO: cleanup. move hardcoded messages to another place(enum?)
  private async pushDataToDatabox(provider: string, metrics: PushData[]): Promise<MainApiReponse>{
    const succesful: boolean = !metrics.includes(undefined); //if returned metric contain undefined it means that it failed
    const definedMetrics: PushData[] = metrics.filter(item => item !== undefined)

    const metricsSent: string[] = definedMetrics.map(metric => metric.key);
    const metricsSentMessage: string = metricsSent.length == 0 ? "None" : metricsSent.toString();

    const numberOfKPIs: string = "("+metricsSent.length+"/"+metrics.length+")"

    const errorMessage: string = succesful ? undefined : "Error while retrieving one or more metrics"

    let response: MainApiReponse = {
      provider: provider,
      timeOfSending: Date().toLocaleString(),
      metricsSent: metricsSentMessage,
      numberOfKPIs: numberOfKPIs,
      successful: succesful,
      errorMessage: errorMessage
    }

    const dataPostRequest: DataPostRequest = { pushData: definedMetrics };

    //we need to handle the case when sending data to Databox fails specifically
    var transferedToDatabox: boolean = await this.databoxService.pushMetrics(dataPostRequest);
    if (!transferedToDatabox){
      response = {
        provider: provider,
        timeOfSending: Date().toLocaleString(),
        metricsSent: "None",
        numberOfKPIs: "(0/"+metrics.length+")",
        successful: false,
        errorMessage: "Error when sending data to Databox"
      }
    }

    return response
  }

  

  @Cron('0 45 * * * *')//trigger cron. run every hour on 45th minute
  async fetchOpenMeteoDataToDatabox(): Promise<MainApiReponse> {
    const metrics: PushData[] = await this.openmeteoService.getAllMetrics()

    const response = await this.pushDataToDatabox("Openmeteo", metrics)
    this.mainApiResponseRepository.insert(response)

    return response
  }

  @Cron('0 45 * * * *')
  async fetchGitHubDataToDatabox(): Promise<MainApiReponse>{
    const provider: string = "GitHub"

    let metrics: PushData[] = null
    let response = null

    try{
      metrics = await this.githubService.getAllMetrics()
    }
    catch(error){
      if(error === "Unable to obtain access token"){
        return response = {
          provider: provider,
          timeOfSending: Date().toLocaleString(),
          metricsSent: "None",
          numberOfKPIs: "(0/0)",
          successful: false,
          errorMessage: "Unable to obtain access token"
        }
      }
      else{
        return response = {
          provider: provider,
          timeOfSending: Date().toLocaleString(),
          metricsSent: "None",
          numberOfKPIs: "(0/0)",
          successful: false,
          errorMessage: "Error while retrieving one or more metrics"
        }
      }
    }

    response = await this.pushDataToDatabox(provider, metrics)
    this.mainApiResponseRepository.insert(response)

    return response
  }

  async startAuthProcess(): Promise<string>{
    const succesfulRequest: boolean = await this.githubService.startAuthProcess()

    if(succesfulRequest) return "Succesfully obtained new token"
    else return "Authentication failed"
  }
}

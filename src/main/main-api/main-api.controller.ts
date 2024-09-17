import { Controller, Get } from '@nestjs/common';
import { MainApiService } from './main-api.service';
import { MainApiReponse } from './main-api.entity';



@Controller()
export class MainApiController {
  constructor(private readonly mainApiService: MainApiService) {}

  @Get("/openmeteo")
  async fetchOpenMeteoDataToDatabox(): Promise<MainApiReponse> {
      return this.mainApiService.fetchOpenMeteoDataToDatabox();
  }

  @Get("github")
  async fetchGitHubDataToDatabox(): Promise<MainApiReponse> {
      return this.mainApiService.fetchGitHubDataToDatabox();
  }

  @Get("github/auth")
  async startAuthProcess(): Promise<string> {
      return this.mainApiService.startAuthProcess();
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MainApiReponse } from '../main-api/main-api.entity';

@Injectable()
export class LoggingApiService {
  constructor(
    @InjectRepository(MainApiReponse)
    private mainApiResponseRepository: Repository<MainApiReponse>,
  ) {}

  async findAllMainApiResponses(): Promise<MainApiReponse[]> {
      return this.mainApiResponseRepository.find();
  }

  async findMainApiResponseById(id: number): Promise<MainApiReponse> {
    return this.mainApiResponseRepository.findOneBy({ id });
  }
}
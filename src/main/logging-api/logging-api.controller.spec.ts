import { Test } from '@nestjs/testing';
import { LoggingApiController } from './logging-api.controller';
import { LoggingApiService } from './logging-api.service';
import * as matchers from 'jest-extended';

describe('LoggingApiController', () => {
  let loggingApiController: LoggingApiController;
  
  const mockLoggingApiService = {
    findAllMainApiResponses: jest.fn(() => {
      return [
        {
          id: 1,
          timeOfSending: "Sun Sep 15 2024 00:43:51 GMT+0200 (Central European Summer Time)",
          metricsSent: "test",
          numberOfKPIs: "(2/2)",
          successful: true,
          errorMessage: "test",
        },
        {
          id: 2,
          timeOfSending: "Sun Sep 15 2024 00:43:51 GMT+0200 (Central European Summer Time)",
          metricsSent: "test",
          numberOfKPIs: "(0/2)",
          successful: false,
          errorMessage: null,
        }
      ]
    }),

    findMainApiResponseById: jest.fn((id: number) => {
      return {
          id: id,
          timeOfSending: "Sun Sep 15 2024 00:43:51 GMT+0200 (Central European Summer Time)",
          metricsSent: "test",
          numberOfKPIs: "(2/2)",
          successful: true,
          errorMessage: "test",
        }
    })
  };

  beforeEach(async () => {
    expect.extend(matchers);

    const moduleRef = await Test.createTestingModule({
        controllers: [LoggingApiController],
        providers: [LoggingApiService],
      }).overrideProvider(LoggingApiService).useValue(mockLoggingApiService).compile();

    loggingApiController = moduleRef.get<LoggingApiController>(LoggingApiController);
  });

  describe('findAllMainApiResponses', () => {

    it('should return an array of MainApiResponse', async () => {
      let responses = await loggingApiController.findAllMainApiResponses()
      
      responses.forEach(res => {
        expect(res).toEqual(
          {
            id: expect.any(Number),
            timeOfSending: expect.any(String), //should be regex for the JS Date.now() format...
            metricsSent: expect.any(String),
            numberOfKPIs: expect.stringMatching(/^\([0-9]+\/[0-9]+\)$/),
            successful: expect.any(Boolean),
            errorMessage: expect.toBeOneOf([expect.any(String), null]),
          }
        )
      });
    });

  });

  describe('findMainApiResponseById', () => {

    it('should return a MainApiResponse with the requested id', async () => {

      let res = await loggingApiController.findMainApiResponseById({id: 1})

      expect(res).toEqual(
        {
          id: 1,
          timeOfSending: expect.any(String), //should be regex for the JS Date.now() format...
          metricsSent: expect.any(String),
          numberOfKPIs: expect.stringMatching(/^\([0-9]+\/[0-9]+\)$/),
          successful: expect.any(Boolean),
          errorMessage: expect.toBeOneOf([expect.any(String), null]),
        }
      )
    });

  });

});

import { Test } from '@nestjs/testing';
import { MainApiController } from './main-api.controller';
import { MainApiService } from './main-api.service';
import * as matchers from 'jest-extended';

describe('MainApiController', () => {
  let mainApiController: MainApiController;

    const mockMainApiService = {
        fetchOpenMeteoDataToDatabox: jest.fn()
    };

    beforeEach(async () => {
        expect.extend(matchers);

        const moduleRef = await Test.createTestingModule({
            controllers: [MainApiController],
            providers: [MainApiService],
        }).overrideProvider(MainApiService).useValue(mockMainApiService).compile();

        mainApiController = moduleRef.get<MainApiController>(MainApiController);
    });

    describe('fetchOpenMeteoDataToDatabox', () => {

        it('should return a MainApiResponse with error message', async () => {

            mockMainApiService.fetchOpenMeteoDataToDatabox.mockImplementation(async () => {
                return {
                    id: 1,
                    provider: "GitHub",
                    timeOfSending: "Sun Sep 15 2024 00:43:51 GMT+0200 (Central European Summer Time)",
                    metricsSent: "test",
                    numberOfKPIs: "(1/2)",
                    successful: false,
                    errorMessage: "test",
                }
            })

            let res = await mainApiController.fetchOpenMeteoDataToDatabox()
            
            expect(res).toEqual(
                {
                id: 1,
                provider: expect.any(String),
                timeOfSending: expect.any(String), //should be regex for the JS Date.now() format...
                metricsSent: expect.any(String),
                numberOfKPIs: expect.stringMatching(/^\([0-9]+\/[0-9]+\)$/),
                successful: expect.any(Boolean),
                errorMessage: expect.toBeOneOf([expect.any(String), undefined])
                }
            )
        
        });

        it('should return a MainApiResponse without error message', async () => {

            mockMainApiService.fetchOpenMeteoDataToDatabox.mockImplementation(async () => {
                return {
                    id: 2,
                    provider: "Openmeteo",
                    timeOfSending: "Sun Sep 15 2024 00:43:51 GMT+0200 (Central European Summer Time)",
                    metricsSent: "opa",
                    numberOfKPIs: "(2/2)",
                    successful: false,
                }
            })

            let res = await mainApiController.fetchOpenMeteoDataToDatabox()

            expect(res).toEqual(
                {
                id: 2,
                provider: expect.any(String),
                timeOfSending: expect.any(String), //should be regex for the JS Date.now() format...
                metricsSent: expect.any(String),
                numberOfKPIs: expect.stringMatching(/^\([0-9]+\/[0-9]+\)$/),
                successful: expect.any(Boolean),
                errorMessage: expect.toBeOneOf([expect.any(String), undefined])
                }
            )
        
        });

    });

});
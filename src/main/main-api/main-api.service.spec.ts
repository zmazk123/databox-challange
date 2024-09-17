import { Test } from '@nestjs/testing';
import { MainApiService } from './main-api.service';
import * as matchers from 'jest-extended';
import { MainApiReponse } from './main-api.entity';
import { DataboxService } from 'src/api_integrations/databox/databox.service';
import { OpenmeteoService } from 'src/api_integrations/source_apis/openmeteo/openmeteo.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GithubService } from 'src/api_integrations/source_apis/github/github.service';

describe('MainApiService', () => {

    let mainApiService: MainApiService;

    const mockDataboxService = {
        pushMetrics: jest.fn()
    };

    const mockOpenMeteoService = {
        getAllMetrics: jest.fn()
    };

    const mockGitHubService = {
        getAllMetrics: jest.fn(),
        startAuthProcess: jest.fn()
    };

    const mockMainApiResponseRepository = {
        insert: jest.fn()
    };

    beforeEach(async () => {
        expect.extend(matchers);

        const moduleRef = await Test.createTestingModule({
            providers: [MainApiService, DataboxService, OpenmeteoService, GithubService, {provide: getRepositoryToken(MainApiReponse), useValue: mockMainApiResponseRepository}],
        })
        .overrideProvider(DataboxService).useValue(mockDataboxService)
        .overrideProvider(OpenmeteoService).useValue(mockOpenMeteoService)
        .overrideProvider(GithubService).useValue(mockGitHubService)
        .compile()

        mainApiService = moduleRef.get<MainApiService>(MainApiService);
    });

    describe('fetchOpenMeteoDataToDatabox', () => {

        it('should return a succesful MainApiResponse if OpenMeteo and Databox respond correctly', async () => {

            mockOpenMeteoService.getAllMetrics.mockImplementation(async () => {
                return [
                    {key: "temperature_2m", value: 123},
                    {key: "precipitation", value: 1}
                ]
            })

            mockDataboxService.pushMetrics.mockImplementation(async () => {
                return true
            })

            let res = await mainApiService.fetchOpenMeteoDataToDatabox()

            expect(res).toEqual(
                {
                provider: "Openmeteo",
                timeOfSending: expect.any(String), //should be regex for the JS Date.now() format...
                metricsSent: "temperature_2m,precipitation",
                numberOfKPIs: "(2/2)",
                successful: true,
                errorMessage: undefined
                }
            )
        
        });

        it('should return an error MainApiResponse if OpenMeteo fails on one API call and Databox responds correctly', async () => {

            mockOpenMeteoService.getAllMetrics.mockImplementation(async () => {
                return [
                    {key: "temperature_2m", value: 123},
                    undefined
                ]
            })

            mockDataboxService.pushMetrics.mockImplementation(async () => {
                return true
            })

            let res = await mainApiService.fetchOpenMeteoDataToDatabox()

            expect(res).toEqual(
                {
                provider: "Openmeteo",
                timeOfSending: expect.any(String), //should be regex for the JS Date.now() format...
                metricsSent: "temperature_2m",
                numberOfKPIs: "(1/2)",
                successful: false,
                errorMessage: "Error while retrieving one or more metrics"
                }
            )
        
        });

        it('should return an error MainApiResponse if data fails to push to Databox', async () => {

            mockOpenMeteoService.getAllMetrics.mockImplementation(async () => {
                return [
                    {key: "temperature_2m", value: 123},
                    {key: "precipitation", value: 1}
                ]
            })

            mockDataboxService.pushMetrics.mockImplementation(async () => {
                return false
            })

            let res = await mainApiService.fetchOpenMeteoDataToDatabox()
            
            expect(res).toEqual(
                {
                provider: "Openmeteo",
                timeOfSending: expect.any(String), //should be regex for the JS Date.now() format...
                metricsSent: "None",
                numberOfKPIs: "(0/2)",
                successful: false,
                errorMessage: "Error when sending data to Databox"
                }
            )
        
        });

        it('should return a correct response for numberOfKPIs and metricsSent', async () => {

            mockOpenMeteoService.getAllMetrics.mockImplementation(async () => {
                return [
                    {key: "temperature_2m", value: 123},
                    {key: "precipitation", value: 1},
                    undefined,
                    {key: "test1", value: 1},
                    undefined,
                    {key: "test2", value: 123},
                    {key: "test3", value: 12},
                    undefined,
                    undefined,
                ]
            })

            mockDataboxService.pushMetrics.mockImplementation(async () => {
                return true
            })

            let res = await mainApiService.fetchOpenMeteoDataToDatabox()
            
            expect(res).toEqual(
                {
                provider: "Openmeteo",
                timeOfSending: expect.any(String), //should be regex for the JS Date.now() format...
                metricsSent: "temperature_2m,precipitation,test1,test2,test3",
                numberOfKPIs: "(5/9)",
                successful: false,
                errorMessage: "Error while retrieving one or more metrics"
                }
            )
        
        });

    });

    describe('fetchGithubDataToDatabox', () => {

        it('should return a succesful MainApiResponse if Github and Databox respond correctly', async () => {

            mockGitHubService.getAllMetrics.mockImplementation(async () => {
                return [
                    {key: "commits", value: 123},
                    {key: "subscribers", value: 1}
                ]
            })

            mockDataboxService.pushMetrics.mockImplementation(async () => {
                return true
            })

            let res = await mainApiService.fetchGitHubDataToDatabox()

            expect(res).toEqual(
                {
                provider: "GitHub",
                timeOfSending: expect.any(String), //should be regex for the JS Date.now() format...
                metricsSent: "commits,subscribers",
                numberOfKPIs: "(2/2)",
                successful: true,
                errorMessage: undefined
                }
            )
        
        });

        it('should return an error MainApiResponse if Github fails on one API call and Databox responds correctly', async () => {

            mockGitHubService.getAllMetrics.mockImplementation(async () => {
                return [
                    {key: "commits", value: 123},
                    undefined
                ]
            })

            mockDataboxService.pushMetrics.mockImplementation(async () => {
                return true
            })

            let res = await mainApiService.fetchGitHubDataToDatabox()

            expect(res).toEqual(
                {
                provider: "GitHub",
                timeOfSending: expect.any(String), //should be regex for the JS Date.now() format...
                metricsSent: "commits",
                numberOfKPIs: "(1/2)",
                successful: false,
                errorMessage: "Error while retrieving one or more metrics"
                }
            )
        
        });

        it('should return an error MainApiResponse if data fails to push to Databox', async () => {

            mockGitHubService.getAllMetrics.mockImplementation(async () => {
                return [
                    {key: "commits", value: 123},
                    {key: "subscribers", value: 1}
                ]
            })

            mockDataboxService.pushMetrics.mockImplementation(async () => {
                return false
            })

            let res = await mainApiService.fetchGitHubDataToDatabox()
            
            expect(res).toEqual(
                {
                provider: "GitHub",
                timeOfSending: expect.any(String), //should be regex for the JS Date.now() format...
                metricsSent: "None",
                numberOfKPIs: "(0/2)",
                successful: false,
                errorMessage: "Error when sending data to Databox"
                }
            )
        
        });

        it('should return an error if we cannot obtain Github API access token', async () => {

            mockGitHubService.getAllMetrics.mockImplementation(async () => {
                throw "Unable to obtain access token"
            })

            let res = await mainApiService.fetchGitHubDataToDatabox()
            
            expect(res).toEqual(
                {
                provider: "GitHub",
                timeOfSending: expect.any(String), //should be regex for the JS Date.now() format...
                metricsSent: "None",
                numberOfKPIs: "(0/0)",
                successful: false,
                errorMessage: "Unable to obtain access token"
                }
            )
        
        });

    });

    describe('startAuthProcess', () => {

        it('should return success message if authentication was successful', async () => {

            mockGitHubService.startAuthProcess.mockImplementation(async () => {
                return true
            })

            let res = await mainApiService.startAuthProcess()

            expect(res).toEqual("Succesfully obtained new token")
        
        });

        it('should return failure message if authentication was unsuccessful', async () => {

            mockGitHubService.startAuthProcess.mockImplementation(async () => {
                return false
            })

            let res = await mainApiService.startAuthProcess()

            expect(res).toEqual("Authentication failed")
        
        });

    });
});
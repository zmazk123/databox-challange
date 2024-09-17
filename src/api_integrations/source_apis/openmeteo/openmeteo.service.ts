import { Injectable } from '@nestjs/common';
import { fetchWeatherApi } from 'openmeteo';
import { PushData } from "databox";

@Injectable()
export class OpenmeteoService {

    private readonly url = process.env.OPENMETEO_URL;

    //tokens here should match metric token on the databox platform
    //can we do this in a better way???
    private readonly metricTokens: string[] = ["temperature_2m", "precipitation"]; 

    private async getMetric(metricToken: string): Promise<PushData>{
        try{
            const params = {
                "latitude": 46.5547,//coordinates for Maribor :)
                "longitude": 15.6467,
                "current": metricToken,
                "forecast_days": 1
            };
    
            const responses = await fetchWeatherApi(this.url, params);
            const response = responses[0];
            const current = response.current()!;
            const metric: number =  current.variables(0)!.value()

            const pushData: PushData = {
                    key: metricToken,
                    value: metric,
            };

            console.log("Retreived " + metricToken + " from Openmeteo: " + metric)
            return pushData
        }
        catch (error) {
            console.log("Error: ", error);
        }
    }

    async getAllMetrics(): Promise<PushData[]> {
        //we do this because we want to get metrics in parallel
        const responseSettleResults = await Promise.allSettled(this.metricTokens.map((token) => this.getMetric(token)))

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
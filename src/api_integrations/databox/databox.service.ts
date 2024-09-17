import { Injectable } from '@nestjs/common';

import {
  ApiResponse,
  Configuration,
  DataPostRequest,
  DefaultApi,
} from "databox";

@Injectable()
export class DataboxService {
    //TODO: move to env
    private readonly config: Configuration = new Configuration({
        basePath: process.env.DATABOX_URL,
        username: process.env.DATABOX_TOKEN,
        headers: {
          Accept: "application/vnd.databox.v2+json",
        },
    });

    private api = new DefaultApi(this.config);

    async pushMetrics(metrics: DataPostRequest): Promise<boolean> {
        try {
            await this.api
                .dataPostRaw(metrics)
                .then((response: ApiResponse<void>) => response.raw.json())
                .then((responseBody) => {
                console.log("Response data", responseBody);
            });

            return true
        }
        //return false if fails
        catch (error) {
            return false
        }
    }
}
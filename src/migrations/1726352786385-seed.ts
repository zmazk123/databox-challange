import { MigrationInterface, QueryRunner } from "typeorm";

export class Seed1726352786385 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(//TODO: move to outside enum, becouse entity decorator needs to match
            `CREATE TABLE IF NOT EXISTS main_api_response (
                id int,
                provider varchar(255),
                timeOfSending varchar(255),
                metricsSent varchar(255), 
                numberOfKPIs varchar(255), 
                successful boolean,
                errorMessage varchar(255)
            )`
        )
        await queryRunner.query(
            `INSERT INTO main_api_response (provider, timeOfSending, metricsSent, numberOfKPIs, successful)
            VALUES ("Openmeteo", "Sun Sep 15 2024 00:43:51 GMT+0200 (Central European Summer Time)", "testMetric, anotherMetric", "(2/2)", TRUE)`
        )

        await queryRunner.query(
            `INSERT INTO main_api_response (provider, timeOfSending, metricsSent, numberOfKPIs, successful)
            VALUES ("GitHub", "Mon Sep 15 2024 11:43:51 GMT+0200 (Central European Summer Time)", "None", "(0/2)", FALSE)`
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}

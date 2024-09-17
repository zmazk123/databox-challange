import { DataSource, DataSourceOptions } from "typeorm";
import { MainApiReponse } from './main/main-api/main-api.entity';
import { Seed1726352786385 } from './migrations/1726352786385-seed';
import { AccessToken } from './api_integrations/source_apis/github/github.auth-service.entity';
import { config } from 'dotenv'

config()

export const configDb = {
    type: 'mysql',
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: 'databox_challange',
    entities: [MainApiReponse, AccessToken],
    migrations: [Seed1726352786385],
    synchronize: true,
}

export const connectionSource = new DataSource(configDb as DataSourceOptions);

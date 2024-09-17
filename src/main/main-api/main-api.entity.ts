import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity("main_api_response")
export class MainApiReponse {
    @PrimaryGeneratedColumn()
    id?: number

    @Column()
    provider: string

    @Column()
    timeOfSending: string

    @Column()
    metricsSent: string

    @Column()
    numberOfKPIs: string

    @Column()
    successful: boolean

    @Column({ nullable: true })
    errorMessage?: string
}
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { EncryptionTransformer } from 'typeorm-encrypted';
import { config } from 'dotenv'

config()

@Entity("access_token")
export class AccessToken {
    @PrimaryGeneratedColumn()
    id?: number
    
    //AES encryption for access token
    //TODO: move key to env
    @Column({
        type: "varchar",
        nullable: false,
        transformer: new EncryptionTransformer({
          key: process.env.GITHUB_ACCESS_TOKEN_AES_ENCRYPTION_KEY,
          algorithm: 'aes-256-gcm',
          ivLength: 16
        })
    })
    accessToken: string
}
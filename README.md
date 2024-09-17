# Databox - Backend engineer challenge

The aim of this project is to integrate metrics from Openmeteo and Github with Databox.

From Openmeteo we are integrating 2 metrics - Temperature in Maribor and Precipitation in Maribor.

From GitHub we are integrating 2 metrics - GAN_Illumination Commits and GAN_Illumination Subscribers.

The dashboard is available at: https://app.databox.com/datawall/307bffadac82e9ddf143e98c4a1d6b0b4569e5c66e897e7

Email address used for creating the dashboard and pushing data: markozmazek123@gmail.com

## Requirements

Make sure that the following is installed on your computer:
  - [Node](https://nodejs.org/en/download/package-manager/current)
  - [Docker](https://docs.docker.com/engine/install/)

## Instructions

1) Clone the repository: `git clone https://github.com/zmazk123/databox-challange.git`

2) Install all dependencies: `npm i`

3) Start up the database: `docker compose -f docker-compose-mysql.yml up`

4) Seed the database with some demo data: `npm run migration:run`

5) Start up the service: `npm run start`

6) To run unit tests: `npm run test`

### API

The following endpoints are available to you:

#### Openmeteo

    GET http://localhost:3000/openmeteo

Will push Openmeteo KPIs to Databox.

#### Github

    GET http://localhost:3000/github

Will push Github KPIs to Databox. In case that an OAuth token has not been obtained, it will start the authentication process.

    GET http://localhost:3000/github/auth

Will start the authentication process to obtain the OAuth access token. You will be guided by the CLI.

#### Logger

    GET http://localhost:3000/logger

Get a list of all responses.

    GET http://localhost:3000/logger/:id<number>

Get a response with :id.

### Logging
When you push data to Databox you will receive a response in the form of:

    {
        "provider": "GitHub",
        "timeOfSending": "Tue Sep 17 2024 17:13:50 GMT+0200 (Central European Summer Time)",
        "metricsSent": "subscribers,commits",
        "numberOfKPIs": "(2/2)",
        "successful": true
    }

The responses will be saved in the database and can be accessed via `/logger` endpoint.

### Schedule

Currently, there is Cron setup to push data from Openmeteo and Github every hour at the 45th minute => @Cron('0 45 * * * *')

### OAuth2 authentication for GitHub

To access GitHub's API, you first need to obtain an access token. You will be automatically prompted to do so the first time you try to get data from GitHub. If your token was revoked, and you can't pull data from GitHub, you can start a new authentication process by calling the `/github/auth` endpoint to obtain a new token.

Because we need to have user interaction with OAuth, this was tricky to implement since we don't have a frontend. Luckily, GitHub offers a solution: [Device Flow](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps#device-flow) can be used in cases we don't have a frontend - such as our case. You will be guided by the CLI. You will receive a link and a code. Follow the link and enter the code. The code expires in a few minutes. Once you successfully obtained the access token, it will be stored in the database so that the following calls to the GitHub API will not require authentication.

1) You are given the link and user code:

![](/readme_images/CLI.png)

2) Go to the link and enter the code:

![](/readme_images/git.png)

## Architecture

I was debating whether I should use ExpressJS or NestJS for this task. In the end, I decided to use NestJS, because it's an opinionated framework and enforces good coding practices. And although I'm completely new to NestJS, the basics were straightforward to pickup. In case we wanted to scale the application, it would be easier with NestJS. Also, NestJS offers a lot of functionalities "out of the box", such as task scheduling (Cron), database integration (TypeORM), testing (Jest),...

NestJS uses modules to split the code into components which encapsulate a closely related set of capabilities. Inside the module, we can find TypeScript files, each with their own task.

- x.controller.ts  -  responsible for handling incoming requests and returning responses to the client.
- x.service.ts  -  responsible for business logic.
- x.entity.ts  -  responsible for defining a database entity.
- x.spec.ts  -  contains unit tests.

## Future improvements

- Better way to handle OAuth. CLI works in our case, but if there were real users, they wouldn't be able to use it. We would need to provide a frontend and a more scalable solution to store multiple tokens.

- More meaningful responses or error messages. Currently, our API responses are very rudimentary. If something went wrong, we should provide descriptive error messages instead of "An error occurred".

- Create an endpoint to push data from all data sources to Databox simultaneously. Currently, we need to push data from each source separately. We would also need to make adding new data sources (new APIs) to integrate more scalable.

- Add a Docker volume to persist our database. Currently, we don't persist our database. If we delete our MySQL container, we lose the data.

- Improve unit test coverage and also design end-to-end tests.

### Scheduling

Currently, we are using NestJS's schedule package to trigger our code.

- We could create a [NestJS standalone app](https://docs.nestjs.com/standalone-applications) and Dockerize it. We could then host it on a Linux server and use [Cron](https://en.wikipedia.org/wiki/Cron) to periodically trigger our code.

- We could host it on a cloud platform, such as AWS or Heroku and use their scheduling service to trigger our code.
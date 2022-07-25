# Devicer

## Introduction

So what's a "Devicer"? This is a small application that will be available to get data from sensors of different devices.

For example, you have a device that has "Thermometer" sensor, that measures room temperature and "Hygrometer" sensor that measures room humidity.

And you want to get the data from the device every second and show it to the user as a dataset and realtime.

That's why we will create a devicer. This will be a combine of microservices that will include:

- Basic micro-services with REST API
- MQTT receiver to get data from devices
- Websocket server to show real-time data
- Frontend application based on ReactJS  

## Stack

In this tutorial we will use:

- [NodeJS](https://nodejs.org/en/) with [TypeScript](https://www.typescriptlang.org/)
- [NestJS](https://nestjs.com/) as framework
- [PostgreSQL](https://www.postgresql.org/) as database
- [TypeORM](https://typeorm.io/) as an ORM that will work with database
- [ReactJS](https://reactjs.org/) as a Frontend framework
- MQTT protocol to receive data
- [Socket.io](https://socket.io/) for websockets and showing data real-time
- [Docker](https://www.docker.com/) for easy way to develop and deploy
- [Postman](https://www.postman.com/) to test out REST API

## Command shortcusts

Frequent CLI commands:

run development server:
`npm run start:dev` 

generate new migrations with %migration_name% name:
`npm run migrations:generate --name=%migration_name%`

run migrations: 
`npm run migrations:run`

run end-to-end tests:
`npm run test:e2e`

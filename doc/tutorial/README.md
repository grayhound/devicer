# Devicer

Welcome to my humble tutorial called "Devicer".

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
- [Jest](https://jestjs.io/) and [supertest](https://github.com/visionmedia/supertest) for end-to-end testing.
- [ReactJS](https://reactjs.org/) as a Frontend framework
- MQTT protocol to receive data
- [Socket.io](https://socket.io/) for websockets and showing data real-time
- [Docker](https://www.docker.com/) for easy way to develop and deploy
- [Postman](https://www.postman.com/) to test out REST API

## Steps

### Backend

1. [Prepare our dev environment and setup PostgeSQL using docker docker-compose](001_prepapre_our_dev_environment.md)
2. [Create REST API endpoints to signup user](002_create_rest_api_endpoints_to_signup_user.md)
3. [Cover REST API endpoints with end-to-end tests](003_cover_rest_api_endpoints_with_tests.md)
4. [Create REST API authentication via JWT (JSON Web Token)](004_create_rest_api_authentication_jwt.md)
5. Create endpoints to add, view, edit and delete devices. This will also include generating auth token for devices.
6. Create MQTT receiver. This will be different application/micro-service that will communcate with base apllication/microservice.
7. Create REST API endpoints to show data for Devices.

### Frontend
1. Prepare frontend application
2. Make it possible to signup and authenticate via frontend app
3. Make it possible to add, view, edit, delete devices and view their credentials
4. Display data from devices as simple table
5. Display data from devices as charts
6. Display real-time data as temperature and gauge widget 

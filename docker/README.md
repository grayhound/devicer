# Docker for development

# DEV environment

## Configuration

### Create configuration file.
 
`cp docker/envs/devicer-dev/.env.example docker/envs/devicer-dev/.env`

Change env variables to your liking. In dev env there mostly now need to change those variables. 

### How to run

`cd docker/envs/devicer-dev`
`docker-compose up -d`

### You can re-create images

docker-compose up --force-recreate --build devicer_postgres

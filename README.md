# CapAdmin API

----------

# Getting started

## Installation

Clone the repository

    git clone git@github.com:lujakob/nestjs-realworld-example-app.git

Switch to the repo folder

    cd nestjs-realworld-example-app

Install dependencies

    npm install

Copy config file and set JsonWebToken secret key

    cp .env.example .env

----------

## Database

The example codebase uses [Typeorm](http://typeorm.io/) with a Postgres database.

Create a new Postgres database with the name `cap` (or the name you specified in the ormconfig.json)

Copy Typeorm config example file for database settings

    cp ormconfig.json.example ``

Set Postgres database settings in ormconfig.json

    {
      "type": "postgres",
      "host": "localhost",
      "port": 5432,
      "username": "postgres",
      "password": "postgres",
      "database": "cap",
      "entities": ["src/**/**.entity{.ts,.js}"],
      "synchronize": true
    }

Start local postgres server and create new database 'postgres'

On application start, tables for all entities will be created.

----------

## NPM scripts

- `npm start` - Start application in production mode
- `npm run dev` - Start application in dev mode
- `npm run build` - Build application
- `npm run test` - run Jest test runner

----------

## API Specification

----------

## Start application

- `npm dev`
- Test api with `http://localhost:4000/api/articles` in your favourite browser

----------

# Authentication

This applications uses JSON Web Token (JWT) to handle authentication. The token is passed with each request using the `Authorization` header with `Token` scheme. The JWT authentication middleware handles the validation and authentication of the token. Please check the following sources to learn more about JWT.

----------

# Swagger API docs

This example repo uses the NestJS swagger module for API documentation. [NestJS Swagger](https://github.com/nestjs/swagger) - [www.swagger.io](https://swagger.io/)

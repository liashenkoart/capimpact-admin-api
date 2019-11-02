# APCQ

## Description

### Tech Stacks

- Language: NodeJS + TypeScript
- Runtime: NodeJS 10.x
- DataBase: PostgresSQL
- ORM: TypeORM
- Docker with `docker-compose`

## Installation

```bash
$ yarn

# ts-node
npm install -g ts-node
npm install -g typescript
```

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

## Running the app

### API keys and secrets

You should pass env vars directly from the shell. In development mode, you can create the `.env` file. See example in `.example.env`.

### create database

You should create database before the first time you run the repo locally. Just run the below script in postgresSQL:

```bash
# use default docker-compose
docker-compose up -d
# use environment variables docker-compose
POSTGRES_DB=cap POSTGRES_PORT=5432 POSTGRES_PASSWORD=postgres POSTGRES_PASSWORD=postgres docker-compose up -d
```

### Scripts

```bash
# apcq script
$ yarn apqc

# or
ts-node -r dotenv/config scripts/apqc.ts
```

import { registerAs } from '@nestjs/config';

export default registerAs('database', () => {
  if (process.env.NODE_ENV === 'test') {
    return {
      default: {
        type: 'sqlite',
        database: ':memory:',
        dropSchema: true,
        synchronize: true,
        logging: false,
      },
    };
  } else {
    return {
      default: {
        type: process.env.DATABASE_TYPE,
        host: process.env.DATABASE_HOST,
        port: process.env.DATABASE_PORT || 5432,
        username: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        defaultGraphPath: process.env.DEFAULT_GRAPH,
        synchronize: true,
        logging: true,
        migrationsRun: false,
        migrations: ['src/migration/*.ts'],
        cli: {
          migrationsDir: 'src/migration',
        },
      },
    };
  }
});

import { Migrator } from '@mikro-orm/migrations';
import { Configuration } from '@mikro-orm/core';
import { Options, PostgreSqlDriver } from '@mikro-orm/postgresql';
import * as models from './models';
import * as migrations from './migrations';
import fs from 'node:fs';

class EnvParser {
    constructor(private env = process.env) { }

    getString(key: string, defaultValue?: string): string {
        let value = this.env[key];

        if (value === undefined) {
            if (defaultValue === undefined) {
                throw new Error(`${key} is not set`);
            } else {
                value = defaultValue;
            }
        }

        return value;
    }

    getStringOptional(key: string, defaultValue: string | undefined): string | undefined {
        const value = this.env[key] || defaultValue;
        return value;
    }

    getInt(key: string, defaultValue: number): number {
        const stringValue = this.env[key];

        const value = stringValue !== undefined
            ? Number.parseInt(stringValue, 10)
            : defaultValue;

        return value;
    }

    getBool(key: string, defaultValue: boolean): boolean {
        const stringValue = this.env[key];

        const value = stringValue !== undefined
            ? stringValue.toLowerCase() === 'true'
            : defaultValue;

        return value;
    }

    getFileContents(key: string): string | undefined {
        let value: string | undefined;

        const filePath = this.env[key];
        if (filePath) {
            value = fs.readFileSync(filePath).toString();
        }

        return value;
    }

}

const env = new EnvParser();

const dbCfg = {
    name: env.getString('DB_DATABASE'),
    user: env.getString('DB_USERNAME'),
    schema: env.getString('DB_SCHEMA', 'public'),
    password: env.getString('DB_PASSWORD'),
    host: env.getString('DB_HOST'),
    port: env.getInt('DB_PORT', 5432),
    mikroOrm: {
        minPoolSize: env.getInt('MIKRO_ORM_MIN_POOL_SIZE', 0),
        maxPoolSize: env.getInt('MIKRO_ORM_MAX_POOL_SIZE', 2),
    },
    ssl: {
        required: env.getBool('DB_SSL_REQUIRED', true),
        ca: env.getFileContents('DB_SSL_CA'),
        key: env.getFileContents('DB_SSL_KEY'),
        cert: env.getFileContents('DB_SSL_CERT'),
        rejectUnauthorized: env.getBool('DB_SSL_REJECT_UNAUTHORIZED', true),
    },
}


let ORMConfigurationOptions: Options = {
    entities: Object.values(models),
    
    migrations: {
        migrationsList: Object.values(migrations),
    },
    driver: PostgreSqlDriver,
    user: dbCfg.user,
    password: dbCfg.password,
    dbName: dbCfg.name,
    host: dbCfg.host,
    port: dbCfg.port,
    driverOptions: {
        connection: {
            ssl: dbCfg.ssl.required
                ? dbCfg.ssl
                : false
        }
    },
    schema: dbCfg.schema,
    logger: console.log.bind(console),
    pool: {
        min: dbCfg.mikroOrm.minPoolSize,
        max: dbCfg.mikroOrm.maxPoolSize,
        idleTimeoutMillis: 5000
    },
    extensions: [Migrator]
};

let ORMConfiguration = new Configuration<PostgreSqlDriver>({ ...ORMConfigurationOptions }, true);
export { ORMConfiguration, ORMConfigurationOptions };
export default ORMConfigurationOptions;
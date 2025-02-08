import { MikroORM } from '@mikro-orm/core';
import { APIGatewayProxyResultV2, Context } from 'aws-lambda';
import { getNestApp } from '../nest-lambda-utils';

enum MigrationAction {
    UP = 'up',
    DOWN = 'down',
    CHECK = 'check',
    PENDING = 'pending',
    LATEST = 'latest',
}

type MigrationOptions = {
    to?: string | number;
};

type MigrationInput = {
    action: MigrationAction;
    options?: MigrationOptions;
};

function assertMigrationInput(input: any): asserts input is MigrationInput {
    if (!input) {
        throw new Error('Missing input');
    }

    if (!input.action) {
        throw new Error('Missing action');
    }

    if (Object.values(MigrationAction).indexOf(input.action) === -1) {
        throw new Error('Invalid action');
    }

    if (input.options) {
        if (typeof input.options !== 'object') {
            throw new Error('Options must be an object');
        }
    }

    if (input.action === MigrationAction.UP || input.action === MigrationAction.DOWN) {
        if (input.options) {
            if (typeof input.options.to !== 'undefined') {
                if (typeof input.options.to !== 'string' && typeof input.options.to !== 'number') {
                    throw new Error('Invalid "to" option');
                }
            }
        }
    }
}

export async function handler(
    event: any, //APIGatewayEvent,
    context: Context): Promise<APIGatewayProxyResultV2> {
    console.log(`Event: ${JSON.stringify(event, null, 2)}`);
    console.log(`Context: ${JSON.stringify(context, null, 2)}`);

    // Parse the input
    let input: MigrationInput;
    try {
        input = event;
        assertMigrationInput(input);
    } catch (e) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: e.message,
            }),
        };
    }

    const app = await getNestApp();
    const orm = app.get(MikroORM, { strict: false });
    const migrator = orm.getMigrator();

    try {
        let returnData: any;

        // Run the migration
        if (input.action === 'up') {
            const results = await migrator.up(input.options);
            returnData = {
                message: 'Migration up successful',
                results,
            }
        } else if (input.action === 'down') {
            const results = await migrator.down(input.options);
            returnData = {
                message: 'Migration down successful',
                results,
            }
        } else if (input.action === 'check') {
            const results = await migrator.checkMigrationNeeded();
            returnData = {
                message: 'Migration check successful',
                results,
            }
        } else if (input.action === 'pending') {
            const results = await migrator.getPendingMigrations();
            returnData = {
                message: 'Migration pending successful',
                results,
            }
        } else if (input.action === 'latest') {
            const results = await migrator.getExecutedMigrations();
            returnData = {
                message: 'Migration latest successful',
                results,
            }
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                action: input.action,
                options: input.options,
                ...returnData
            }),
        };
    } catch (e) {
        console.error(e);

        return {
            statusCode: 500,
            body: JSON.stringify({
                action: input.action,
                options: input.options,
                error: {
                    message: e.message,
                    // stack: e.stack,
                }
            })
        };
    }
};
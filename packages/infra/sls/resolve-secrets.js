const {
    SecretsManagerClient,
    GetSecretValueCommand
} = require("@aws-sdk/client-secrets-manager");

const REGION = "us-east-1";

function fromEnv() {
    return {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_DATABASE,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        ssl_required: process.env.DB_SSL_REQUIRED,
    }
}

async function fromSecretsManager() {
    const client = new SecretsManagerClient({ region: REGION });
    try {
        const response = await client.send(
            new GetSecretValueCommand({
                SecretId: 'db-credentials',
            })
        );
        return JSON.parse(response.SecretString);
    } catch (error) {
        console.error("Failed to fetch secrets:", error);
        throw error;
    }
}

module.exports = async ({ options, resolveVariable }) => {
    const isLocal = process.env.IS_LOCAL === 'true';
    // const stage = await resolveVariable('sls:stage');

    const dbSecrets = isLocal ? fromEnv() : await fromSecretsManager();

    return {
        db: dbSecrets,
        env: process.env,
    };
}
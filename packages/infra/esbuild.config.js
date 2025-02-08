const esbuildPluginTsc = require('esbuild-plugin-tsc');
module.exports = () => ({
    external: [
        'mqtt',
        'nats',
        'amqp-connection-manager',
        '@grpc/grpc-js',
        '@grpc/proto-loader',
        'ioredis',
        'kafkajs',
        'amqplib',
        '@nestjs/websockets',
        // mikroorm
        'mariadb',
        'better-sqlite3',
        'libsql',
        'tedious',
        'mysql',
        'mysql2',
        'oracledb',
        'pg-query-stream',
        'sqlite3',
    ],
    // minify: true,
    plugins: [esbuildPluginTsc()],
    resolveExtensions: ['.ts', '.js', '.mjs']
});
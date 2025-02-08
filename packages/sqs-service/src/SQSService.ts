import { GetQueueUrlCommand, SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ASQSService } from "./ASQSService";

@Injectable()
export class SQSService extends ASQSService{

    private qUrls: Map<string, string> = new Map();
    private sqsClient: SQSClient;
    constructor(
        private readonly config: ConfigService
    ) {
        super();
        this.sqsClient = new SQSClient({
            region: this.config.getOrThrow<string>('aws.region')
        });
    }

    async send(queueName: string, message: any): Promise<any> {
        const queueUrl = await this.getQueueUrl(queueName);
        const sendCmd = new SendMessageCommand({
            MessageBody: typeof message === 'string' ? message : JSON.stringify(message),
            QueueUrl: queueUrl
        });
        return await this.sqsClient.send(sendCmd);
    }

    private async getQueueUrl(queueName: string): Promise<string> {
        if (this.qUrls.has(queueName)) {
            return this.qUrls.get(queueName) as string;
        }
        const queueUrl = await this.sqsClient.send(new GetQueueUrlCommand({
            QueueName: queueName
        }));
        this.qUrls.set(queueName, queueUrl.QueueUrl as string);
        return queueUrl.QueueUrl as string;
    }
}
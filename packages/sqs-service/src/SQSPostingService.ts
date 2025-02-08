import { Injectable } from "@nestjs/common";
import { ASQSService } from "./ASQSService";
import { ConfigService } from "@nestjs/config";
import axios from 'axios';

@Injectable()
export class SQSPostingService extends ASQSService {
        
    queueUrl: string;
    constructor(readonly config: ConfigService) {
        super();
        this.queueUrl = config.getOrThrow("aws.sqs.local.url");
    }

    async send(queueName: string, message: any): Promise<any> {
        const r = await axios.post(this.queueUrl, message);
        return r.data;
    }
}
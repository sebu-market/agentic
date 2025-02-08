
export abstract class ASQSService {

    abstract send(queueName: string, message: any): Promise<any>;
}
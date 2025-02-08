import { SSM } from "@aws-sdk/client-ssm";
import { ASSMService } from "./ASSM.service";
import {Injectable} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";

@Injectable()
export class SSMService extends ASSMService {

    ssm: SSM;
    constructor(
        private config: ConfigService
    ) {
        super();
        this.ssm = new SSM({
            region: this.config.getOrThrow("aws.region")
        });
    }

    async getParameter(name: string, required?: boolean): Promise<string> {
        const response = await this.ssm.getParameter({
            Name: name,
            WithDecryption: true
        });
        const v = response.Parameter?.Value;
        if(!v) {
            if(required) {
                throw new Error(`Could not find required SSM value: ${name}`);
            }
        }
        return v;
    }

    async setParameter(name: string, value: string, overwrite?: boolean): Promise<any> {
        return await this.ssm.putParameter({
            Name: name,
            Value: value,
            Type: "SecureString",
            Overwrite: overwrite
        });
    }

}
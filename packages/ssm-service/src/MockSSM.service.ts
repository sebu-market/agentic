import { Injectable } from "@nestjs/common";
import { ASSMService } from "./ASSM.service";

@Injectable()
export class MockSSMService extends ASSMService {

    params: Map<string, string> = new Map();

    addParameter(name: string, value: string) {
        this.params.set(name, value);
    }

    async getParameter(name: string, required?: boolean): Promise<string> {
        const v = this.params.get(name);
        if (!v) {
            if (required) {
                throw new Error(`Could not find required SSM value: ${name}`);
            }
        }
        return v;
    }

    async setParameter(name: string, value: string): Promise<void> {
        this.params.set(name, value);
    }
}
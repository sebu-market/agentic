import { AClientExtension } from "../AClientExtension";
import {
    GuardianResponseDTOSchema,
    GuardianResponse,
} from '@sebu/dto';

export class GuardianExtension extends AClientExtension {

    async advanceRound(): Promise<GuardianResponse> {
        return await this.postWithValidation<GuardianResponse>({
            path: '/guardian/advance-round',
            responseValidator: GuardianResponseDTOSchema,
        });
    }

}

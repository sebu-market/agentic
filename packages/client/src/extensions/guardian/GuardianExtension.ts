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

    async setRanking(): Promise<GuardianResponse> {
        return await this.postWithValidation<GuardianResponse>({
            path: '/guardian/set-ranking',
            responseValidator: GuardianResponseDTOSchema,
        });
    }

    async isGuardian(): Promise<GuardianResponse> {
        return await this.getWithValidation<GuardianResponse>({
            path: '/guardian/is-guardian',
            responseValidator: GuardianResponseDTOSchema,
        });
    }

}

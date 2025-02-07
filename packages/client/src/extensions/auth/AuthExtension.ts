import { AClientExtension } from "../AClientExtension";
import {
    NonceResponse,
    NonceResponseDTOSchema,
    SigVerificationRequest,
    SigVerificationRequestDTOSchema,
    SigVerificationResponse,
    SigVerificationResponseDTOSchema,
    SebuSessionCookieDataSchema,
    SebuSessionCookie,
} from '@template/dto';

export class AuthExtension extends AClientExtension {

    async getNonce(): Promise<NonceResponse> {
        return await this.getWithValidation<NonceResponse>({
            path: '/auth/nonce',
            responseValidator: NonceResponseDTOSchema,
        });
    }

    async verifySignature(body: SigVerificationRequest): Promise<SigVerificationResponse> {
        return await this.postWithValidation<SigVerificationResponse>({
            path: '/auth/verify',
            body: {
                data: body,
                validator: SigVerificationRequestDTOSchema,
            },
            responseValidator: SigVerificationResponseDTOSchema,
        });
    }

    async getSession(): Promise<SebuSessionCookie> {
        return await this.getWithValidation<SebuSessionCookie>({
            path: '/auth/session',
            responseValidator: SebuSessionCookieDataSchema,
        });
    }

    async logout(): Promise<void> {
        return await this.getWithValidation<void>({
            path: '/auth/logout',
            responseValidator: null,
        });
    }

}

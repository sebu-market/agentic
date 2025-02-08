import { EntityByIDRequest, EntityByIDRequestDTOSchema, MessageRequest, MessageRequestDTOSchema, MessageResponseDTO, MessageResponseDTOSchema, MessageSendRequest, MessageSendRequestDTOSchema, PitchMetadata, PitchMetadataDTOSchema, PitchMetadataList, PitchMetadataListDTOSchema } from '@sebu/dto';
import { AClientExtension } from "../AClientExtension";


export class PitchesExtension extends AClientExtension {
    async getPitch(params: EntityByIDRequest): Promise<PitchMetadata> {
        return await this.getWithValidation<PitchMetadata>({
            path: '/pitches/:id',
            params: {
                data: params,
                validator: EntityByIDRequestDTOSchema,
            },
            responseValidator: PitchMetadataDTOSchema,
        });
    }

    async getPitches(): Promise<PitchMetadataList> {
        return await this.getWithValidation<PitchMetadataList>({
            path: '/pitches',
            responseValidator: PitchMetadataListDTOSchema,
        });
    }

    async getPitchMessages(params: MessageRequest): Promise<MessageResponseDTO> {
        return await this.getWithValidation<MessageResponseDTO>({
            path: '/pitches/:sessionId/messages/latest',
            params: {
                data: params,
                validator: MessageRequestDTOSchema,
            },
            responseValidator: MessageResponseDTOSchema,
        });
    }

    async sendMessage(body: MessageSendRequest): Promise<MessageResponseDTO> {

        const params: EntityByIDRequest = {
            id: body.sessionId,
        };

        return await this.postWithValidation<MessageResponseDTO>({
            path: '/pitches/:id/messages/send',
            params: {
                data: params,
                validator: EntityByIDRequestDTOSchema,
            },
            body: {
                data: body,
                validator: MessageSendRequestDTOSchema,
            },
            responseValidator: MessageResponseDTOSchema,
        });
    }

    async rankedLeaderboard(): Promise<PitchMetadataList> {
        return await this.getWithValidation<PitchMetadataList>({
            path: '/pitches/pitchLeaders',
            responseValidator: PitchMetadataListDTOSchema,
        });
    }

}


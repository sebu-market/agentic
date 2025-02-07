import {
    EntityByIDRequest,
    EntityByIDRequestDTOSchema,
    MessageRequest,
    MessageRequestDTOSchema,
    MessageResponseDTO,
    MessageResponseDTOSchema,
    MessageSendRequest,
    MessageSendRequestDTOSchema,
    ScreeningMetadata,
    ScreeningMetadataDTOSchema,
    ScreeningMetadataList,
    ScreeningMetadataListDTOSchema
} from '@template/dto';
import { AClientExtension } from "../AClientExtension";


export class ScreeningsExtension extends AClientExtension {
    async getScreening(params: EntityByIDRequest): Promise<ScreeningMetadata> {
        return await this.getWithValidation<ScreeningMetadata>({
            path: '/screenings/:id',
            params: {
                data: params,
                validator: EntityByIDRequestDTOSchema,
            },
            responseValidator: ScreeningMetadataDTOSchema,
        });
    }

    async getScreenings(): Promise<ScreeningMetadataList> {
        return await this.getWithValidation<ScreeningMetadataList>({
            path: '/screenings',
            responseValidator: ScreeningMetadataListDTOSchema,
        });
    }

    async getScreeningMessages(params: MessageRequest): Promise<MessageResponseDTO> {
        return await this.getWithValidation<MessageResponseDTO>({
            path: '/screenings/:sessionId/messages/latest',
            params: {
                data: params,
                validator: MessageRequestDTOSchema,
            },
            responseValidator: MessageResponseDTOSchema,
        });
    }

    // async getPitchList(params: GetPitchListRequestParams): Promise<GetPitchListResponseBody> {
    //     return await this.getWithValidation<GetPitchListResponseBody>({
    //         path: '/pitches',
    //         params: {
    //             data: params,
    //             validator: GetPitchListRequestParamsValidator,
    //         },
    //         responseValidator: GetPitchListResponseBodyValidator,
    //     });
    // }

    async createScreening(): Promise<ScreeningMetadata> {
        return await this.postWithValidation<ScreeningMetadata>({
            path: '/screenings/create',
            responseValidator: ScreeningMetadataDTOSchema,
        });
    }

    async sendMessage(body: MessageSendRequest): Promise<MessageResponseDTO> {

        const params: EntityByIDRequest = {
            id: body.sessionId,
        };

        return await this.postWithValidation<MessageResponseDTO>({
            path: '/screenings/:id/messages/send',
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

    // async update(body: ): Promise<UpdatePitchResponseBody> {
    //     return await this.putWithValidation<UpdatePitchResponseBody>({
    //         path: '/pitches/:id',
    //         params: {
    //             data: { id: body.id },
    //         },
    //         body: {
    //             data: body,
    //             validator: UpdatePitchRequestBodyValidator,
    //         },
    //         responseValidator: UpdatePitchResponseBodyValidator,
    //     });
    // }

    // async delete(params: DeletePitchRequestParams): Promise<DeletePitchResponseBody> {
    //     return await this.deleteWithValidation<DeletePitchResponseBody>({
    //         path: '/pitches/:id',
    //         params: {
    //             data: params,
    //             validator: DeletePitchRequestParamsValidator,
    //         },
    //         responseValidator: DeletePitchResponseBodyValidator,
    //     });
    // }

}


import { EntityByIDRequest, EntityByIDRequestDTOSchema, PitchMetadata, PitchMetadataDTOSchema } from "@template/dto";
import { AClientExtension } from "../AClientExtension";

export class PaymentSimulationExtension extends AClientExtension {

    async simulate(params: EntityByIDRequest): Promise<PitchMetadata> {
        return await this.postWithValidation<PitchMetadata>({
            path: '/payment/simulate/:id',
            params: {
                data: params,
                validator: EntityByIDRequestDTOSchema,
            },
            responseValidator: PitchMetadataDTOSchema,
        });
    }
}
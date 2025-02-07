import { AClientExtension } from "../AClientExtension";

export class RoundsExtension extends AClientExtension {
    // async getRound(params: GetRoundRequestParams): Promise<GetRoundResponseBody> {
    //     return await this.getWithValidation<GetRoundResponseBody>({
    //         path: '/rounds/:id',
    //         params: {
    //             data: params,
    //             validator: GetRoundRequestParamsValidator,
    //         },
    //         responseValidator: GetRoundResponseBodyValidator,
    //     });
    // }

    // async getCurrentRound(): Promise<GetRoundResponseBody> {
    //     return await this.getWithValidation<GetRoundResponseBody>({
    //         path: '/rounds/current',
    //         responseValidator: GetRoundResponseBodyValidator,
    //     });
    // }

    // async getRoundList(params: GetRoundListRequestParams): Promise<GetRoundListResponseBody> {
    //     return await this.getWithValidation<GetRoundListResponseBody>({
    //         path: '/rounds',
    //         params: {
    //             data: params,
    //             validator: GetRoundListRequestParamsValidator,
    //         },
    //         responseValidator: GetRoundListResponseBodyValidator,
    //     });
    // }
}

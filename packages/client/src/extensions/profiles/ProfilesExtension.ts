import { AClientExtension } from "../AClientExtension";

export class ProfilesExtension extends AClientExtension {

    // async getProfile(params: GetProfileRequestParams): Promise<GetProfileResponseBody> {
    //     return await this.getWithValidation<GetProfileResponseBody>({
    //         path: '/profiles/:id',
    //         params: {
    //             data: params,
    //             validator: GetProfileRequestParamsValidator,
    //         },
    //         responseValidator: GetProfileResponseBodyValidator,
    //     });
    // }

    // async getMyProfile(): Promise<GetProfileResponseBody> {
    //     return await this.getWithValidation<GetProfileResponseBody>({
    //         path: '/profiles/me',
    //         responseValidator: GetProfileResponseBodyValidator,
    //     });
    // }

}
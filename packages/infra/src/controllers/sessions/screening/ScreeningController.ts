import { Controller, Get, Logger, Param, Post, Req, UseGuards } from "@nestjs/common";
import { ADataStoreFactory, Screening, SebuUser, TokenMetadata } from "@sebu/db-models";
import { ScreeningMetadataDTO, ScreeningMetadataDTOSchema, ScreeningMetadataListDTO } from "@sebu/dto";
import { AuthGuard } from "../../../guards";
import { AScreeningService } from "../../../services";
import { toErrorDTO } from "../../../utils/error-utils";
import { sessionTimeRemainingSeconds } from "../../../utils/sessionTimeRemaining";


@Controller("screenings")
export class ScreeningController {

    private readonly log: Logger = new Logger(ScreeningController.name);
    constructor(
        readonly ds: ADataStoreFactory,
        readonly ssvc: AScreeningService
    ) { }

    @Post('create')
    @UseGuards(AuthGuard)
    async createScreening(
        @Req() req
    ) {
        const user = AuthGuard.getUser(req);
        if (!user) {
            return toErrorDTO("Unauthorized", 401);
        }

        try {
            const screening = await this.ssvc.createScreening(user);
            return this.toScreeningDTO(screening, user);
        } catch (e: any) {
            this.log.error(e, e.stack);
            return toErrorDTO(e);
        }
    }

    @Get('')
    @UseGuards(AuthGuard)
    async getScreeningList(
        @Req() req,
        @Param() params: any
    ) {
        const sessionId = parseInt(params.id, 10);
        const user = AuthGuard.getUser(req);
        if (!user) {
            return toErrorDTO("Unauthorized", 401);
        }

        try {
            const screenings = await this.ssvc.findByOwner(user);

            if (!screenings) {
                return toErrorDTO("Screening not found", 404);
            }

            /*
            this.log.log({
                screening: screenings,
                owner: user,
            });
            */

            const response: ScreeningMetadataListDTO = {
                results: screenings.map((it) => this.toScreeningDTO(it, user))
            };

            return response;
        } catch (e: any) {
            this.log.error(e, e.stack);
            return toErrorDTO(e);
        }
    }

    @Get(':id')
    @UseGuards(AuthGuard)
    async getScreening(
        @Req() req,
        @Param() params: any
    ) {
        const sessionId = parseInt(params.id, 10);
        const user = AuthGuard.getUser(req);
        if (!user) {
            return toErrorDTO("Unauthorized", 401);
        }

        try {
            const screening = await this.ssvc.getScreening(sessionId);

            if (!screening) {
                return toErrorDTO("Screening not found", 404);
            }

            /*
            this.log.log({
                screening,
                owner: screening.owner,
            });
            */

            // verify the current user is either the owner of the screening or an admin
            if (screening.owner.user_wallet.toLowerCase() !== user.user_wallet.toLowerCase()) {
                return toErrorDTO("Unauthorized", 401);
            }

            return this.toScreeningDTO(screening, user);
        } catch (e: any) {
            this.log.error(e, e.stack);
            return toErrorDTO(e);
        }
    }

    toScreeningDTO(screening: Screening, user: SebuUser): ScreeningMetadataDTO {
        const remaining = sessionTimeRemainingSeconds(screening);
        const tokenMetadata = screening.tokenMetadata ? {
            chainId: screening.tokenMetadata.chain,
            symbol: screening.tokenMetadata.symbol,
            address: screening.tokenMetadata.address,
            name: screening.tokenMetadata.name,
            decimals: screening.tokenMetadata.decimals,
            volume_usd: screening.tokenMetadata.volume || 0,
            marketCap: screening.tokenMetadata.market_cap || 0,
            price: screening.tokenMetadata.price || 0
        } : undefined;

        return ScreeningMetadataDTOSchema.parse({
            id: screening.id,
            timeRemaining: remaining,
            status: screening.status,
            owner_address: user.user_wallet,
            nextPitchId: screening.followOnPitch?.id,
            tokenMetadata
        });
    }

}

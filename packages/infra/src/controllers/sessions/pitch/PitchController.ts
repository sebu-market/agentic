import { Controller, Get, Logger, Param, Req } from "@nestjs/common";
import { ADataStoreFactory } from "@sebu/db-models";
import { PitchMetadataList } from "@sebu/dto";
import { APitchService } from "../../../services";
import { toErrorDTO } from "../../../utils/error-utils";
import { pitchToDTO } from "../../../utils/sessions/pitchDTOConverter";


@Controller("pitches")
export class PitchController {

    private readonly log: Logger = new Logger(PitchController.name);
    constructor(
        readonly ds: ADataStoreFactory,
        readonly psvc: APitchService
    ) { }

    @Get('')
    async getPitchList(
        @Req() req
    ) {
        try {
            const pitches = await this.psvc.getPitches();

            const response: PitchMetadataList = {
                results: pitches.map(pitchToDTO),
            };

            return response;
        } catch (e: any) {
            this.log.error(e, e.stack);
            return toErrorDTO(e);
        }
    }

    @Get('pitchLeaders')
    async getWinningPitches() {
        try {
            
            const hits = await this.psvc.getWinningPitches();
            const response: PitchMetadataList = {
                results: hits.map(pitchToDTO),
            };
            return response;
        } catch (e: any) {
            this.log.error(e, e.stack);
            return toErrorDTO(e);
        }
    }


    @Get(':id')
    async getPitch(
        @Param() params: any
    ) {
        const sessionId = parseInt(params.id, 10);

        try {
            const pitch = await this.psvc.getPitch(sessionId);

            if (!pitch) {
                return toErrorDTO("Pitch not found", 404);
            }

            // this.log.log({
            //     screening: pitch,
            //     owner: pitch.owner,
            // });

            return pitchToDTO(pitch);
        } catch (e: any) {
            this.log.error(e, e.stack);
            return toErrorDTO(e);
        }
    }

    





}

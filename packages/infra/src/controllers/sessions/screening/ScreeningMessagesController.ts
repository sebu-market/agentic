import { Controller, Get, Logger, UseGuards } from "@nestjs/common";
import { Screening } from "@sebu/db-models";
import { BaseMessagesController } from "../BaseMessagesController";
import { AScreeningService } from "../../../services";


@Controller("screenings/:id/messages")
export class ScreeningMessagesController extends BaseMessagesController<Screening>{

    private readonly _log: Logger = new Logger(ScreeningMessagesController.name);
    constructor(
        readonly ssvc: AScreeningService,
    ) {
        super(ssvc);
    }

    async getSession(id: number): Promise<Screening | null> {
        return this.ssvc.getScreening(id);
    }

    get log(): Logger {
        return this._log;
    }

}
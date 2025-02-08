import { Pitch } from "@sebu/db-models";
import { ABaseSessionService } from "./ABaseSessionService";

export abstract class APitchService extends ABaseSessionService<Pitch> {

    abstract getPitch(id: number): Promise<Pitch>;
    abstract getPitches(): Promise<Pitch[]>;
    abstract getWinningPitches(): Promise<Pitch[]>;
}
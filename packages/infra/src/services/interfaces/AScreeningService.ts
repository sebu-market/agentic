import { Screening, SebuUser } from "@sebu/db-models";
import { ABaseSessionService } from "./ABaseSessionService";

export abstract class AScreeningService extends ABaseSessionService<Screening> {
    abstract getScreening(id: number): Promise<Screening>;
    abstract findByOwner(user: SebuUser): Promise<Screening[]>;
    abstract createScreening(user: SebuUser): Promise<Screening>;
}
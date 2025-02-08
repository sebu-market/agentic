import { Screening, SebuUser } from "../../models";
import { ABaseStore } from "./ABaseStore";
import { PaginationOptions } from "./PaginationOptions";

export abstract class AScreeningStore extends ABaseStore<Screening> {

    abstract findByOwner(owner: SebuUser, options?: PaginationOptions) : Promise<Screening[]>;

}
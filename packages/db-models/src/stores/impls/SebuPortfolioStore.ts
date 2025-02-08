import { EntityManager } from "@mikro-orm/core";
import { SebuPortfolio } from "../../models";
import { BaseStore } from "./BaseStore";
import { IStoreContext } from "../interfaces";

export class SebuPortfolioStore extends BaseStore<SebuPortfolio> {

    constructor(
        readonly em: EntityManager,
        readonly ctx: IStoreContext
    ) {
        super(em, SebuPortfolio);
    }
}
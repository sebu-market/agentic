import { EntityManager } from "@mikro-orm/core";
import { Type } from "@nestjs/common";
import { AInvestmentRoundStore, AInvestorPortfolioStore, APendingLPStore, ASebuPortfolioStore, ATokenMetaStore, AUserStore, IStoreContext } from "../interfaces";
import { UserStore } from "./UserStore";
import { AScreeningStore } from "../interfaces/AScreeningStore";
import { ScreeningStore } from "./ScreeningStore";
import { APitchStore } from "../interfaces/APitchStore";
import { PitchStore } from "./PitchStore";
import { InvestmentRoundStore } from "./InvestmentRoundStore";
import { SebuPortfolioStore } from "./SebuPortfolioStore";
import { InvestorPortfolioStore } from "./InvestorPortfolioStore";
import { PendingLPStore } from "./PendingLPStore";
import { TokenMetaStore } from "./TokenMetaStore";

let storeCtxCnt: number = 0;

export class StoreContext implements IStoreContext {
    isDone: boolean = false;
    id: number = ++storeCtxCnt;

    constructor(
        readonly em: EntityManager,
        readonly readOnly: boolean = false,
        readonly name?: string,
    ) { }

    async commit() {
        if (this.isDone) {
            return;
        }
        if (this.em.isInTransaction()) {
            await this.em.commit();
        }
        this.isDone = true;
    }

    async rollback() {
        if (this.isDone) {
            return;
        }
        if (this.em.isInTransaction()) {
            await this.em.rollback();
        }
        this.isDone = true;
    }

    getDataStore<TInput = any, TResult = TInput>(typeOrToken: Type<TInput> | Function | string | symbol): TResult {
        const em = this.em;
        switch (typeOrToken) {

            case AUserStore: {
                return new UserStore(em, this) as any as TResult;
            }

            case AScreeningStore: {
                return new ScreeningStore(em, this) as any as TResult;
            }

            case APitchStore: {
                return new PitchStore(em, this) as any as TResult;
            }

            case AInvestmentRoundStore: {
                return new InvestmentRoundStore(em, this) as any as TResult;
            }

            case ASebuPortfolioStore: {
                return new SebuPortfolioStore(em, this) as any as TResult;
            }

            case AInvestorPortfolioStore: {
                return new InvestorPortfolioStore(em, this) as any as TResult;
            }

            case APendingLPStore: {
                return new PendingLPStore(em, this) as any as TResult;
            }

            case ATokenMetaStore: {
                return new TokenMetaStore(em, this) as any as TResult;
            }
            
            default: throw new Error("Unsupported data model store: " + typeOrToken.toString());
        }
    }
}

import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { ACookieManager } from "../services";
import { ADataStoreFactory, AUserStore, SebuUser } from "@sebu/db-models";

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(
        readonly cookieMgr: ACookieManager,
        readonly ds: ADataStoreFactory
    ) {

    }

    static getUser(req: any) : SebuUser {
        const user = req.user as SebuUser;
        if (!user) {
            throw new Error('Unauthorized');
        }
        return user;
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const cookieData = await this.cookieMgr.getSession(request, response);
        if (!cookieData) {
            return false;
        }
        request.session = cookieData;
        const addy = cookieData.address;
        if(!addy) {
            return false;
        }
        const user : SebuUser | null = await this.ds.readOnlyContext(async (ctx) => {
            const uStore = ctx.getDataStore(AUserStore);
            return await uStore.findByWalletAddress(addy.toLowerCase());
        });

        if(!user) {
            return false;
        }
        request.user = user;
        return true;
    }
}
import { SebuSessionCookieData } from "@sebu/dto";
import { IncomingMessage } from "http";
import { IronSession } from "iron-session";


export type CookieData = IronSession<SebuSessionCookieData>;


export abstract class ACookieManager {
    abstract getSession(
        req: IncomingMessage,
        res: any, // ServerResponse<IncomingMessage>,
    ): Promise<CookieData>;
}
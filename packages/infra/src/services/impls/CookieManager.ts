import { SebuSessionCookieData } from "@sebu/dto";
import { Duration, milliseconds } from "date-fns";
import { getIronSession, SessionOptions, unsealData } from "iron-session";
import { IncomingMessage } from "node:http";
import * as cookie from 'cookie';
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ACookieManager, CookieData } from "../interfaces/ACookieManager";

function seconds(duration: Duration): number {
    return Math.round(milliseconds(duration) / 1000);
}

@Injectable()
export class CookieManager extends ACookieManager {

    protected readonly sessionConfig: SessionOptions;

    constructor(
        readonly config: ConfigService
    ) {
        super();
        const cookiePassword = this.config.getOrThrow<string>('cookies.auth.password');
        this.sessionConfig = {
            // FIXME: store cookie password(s) in env
            // should be random and at least 32 characters long
            password: {
                1: cookiePassword,
            },
            ttl: seconds({ days: 1 }),
            cookieName: 'sebu-session',
            cookieOptions: {
                // domain: process.env.NODE_ENV === 'development'
                //     ? 'localhost'
                //     : 'sebu.market',
                httpOnly: false,
                // secure: process.env.NODE_ENV === 'development' ? false : true,
                // // path: '/',
                sameSite: 'Lax',
            },
        };
    }

    getCookieName(): string {
        return this.sessionConfig.cookieName;
    }

    async getSession(
        req: IncomingMessage,
        res: any, // ServerResponse<IncomingMessage>,
    ): Promise<CookieData> {
        const session = await getIronSession<SebuSessionCookieData>(
            req,
            res,
            this.sessionConfig
        );

        return session;
    }

    async getSessionFromHeaders(
        headers: Record<string, string>
    ): Promise<SebuSessionCookieData | undefined> {

        let session: SebuSessionCookieData | undefined;

        try {
            const cookieHeader = headers.Cookie || headers.cookie;
            const cookies = cookie.parse(cookieHeader);
            const sessionCookie = cookies[
                this.getCookieName()
            ];
            session = await this.unsealSession(sessionCookie);
        } catch (e) {
            console.error('Error getting session from headers:', e);
        }

        return session;
    }

    async unsealSession(sealed: string): Promise<SebuSessionCookieData> {
        const unsealed = await unsealData<SebuSessionCookieData>(sealed, this.sessionConfig);
        return unsealed;
    }
}
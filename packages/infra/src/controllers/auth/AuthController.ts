import { Body, Controller, Get, Post, Req, Res } from "@nestjs/common";
import { ACookieManager } from "../../services/interfaces/ACookieManager";
import { generateSiweNonce, parseSiweMessage } from "viem/siwe";
import { NonceResponseDTOSchema, SebuSessionCookie, SigVerificationRequestDTO, SigVerificationResponseDTOSchema } from "@sebu/dto";
import { createPublicClient, Hex, http } from "viem";
import { ADataStoreFactory, AUserStore, SebuUser } from '@sebu/db-models';
import { type Response } from 'express';
import { arbitrum as chain } from 'viem/chains';

@Controller('auth')
export class AuthController {

    constructor(
        readonly sessionManager: ACookieManager,
        readonly ds: ADataStoreFactory
    ) { }

    @Get('nonce')
    async nonce(
        @Req() req,
        @Res({ passthrough: true }) res: Response) {
        const session = await this.sessionManager.getSession(req, res);

        if (!session.nonce) {
            session.nonce = generateSiweNonce();
            await session.save();
        }

        return NonceResponseDTOSchema.parse({ nonce: session.nonce });
    }

    @Post('verify')
    async verify(
        @Body() dto: SigVerificationRequestDTO,
        @Req() req,
        @Res({ passthrough: true }) res: Response) {
        try {
            const session = await this.sessionManager.getSession(req, res);
            const { message, signature } = dto;

            let hexSig: Hex;
            if (signature.startsWith('0x')) {
                hexSig = `0x${signature.substring(2)}`;
            } else {
                hexSig = `0x${signature}`;
            }

            const parsed = parseSiweMessage(message);

            console.log({
                session,
                message,
                signature,
                parsed,
            });

            if (parsed.nonce !== session.nonce) {
                // assume something is out of sync and clear the session
                console.log(`destroying session due to nonce mismatch`);
                session.destroy();

                res.status(422)
                return { error: 'invalid nonce' }
            }
            const publicClient = createPublicClient({
                chain,
                transport: http(),
            });

            const verified = await publicClient.verifySiweMessage({
                message,
                signature: hexSig,
                nonce: session.nonce,
            });

            if (!verified) {
                console.log(`destroying session due to signature verification failure`);
                session.destroy();

                res.status(422);
                return { error: 'Unable to verify signature.' };
            }

            session.address = parsed.address;
            session.chainId = parsed.chainId;
            await session.save();

            //create usersession here

            await this.ds.readWriteContext(async (ctx) => {
                let commit = true;
                try {

                    const uStore = ctx.getDataStore(AUserStore);
                    //see if user already exists
                    const existing = await uStore.findByWalletAddress(parsed.address.toLowerCase());
                    if (!existing) {
                        const uSession = new SebuUser();
                        uSession.user_wallet = session.address.toLowerCase();
                        await uStore.save(uSession);
                    }
                } catch (error) {
                    console.error(error);
                    commit = false;
                    await ctx.rollback();
                    res.status(400);
                    return {
                        error: 'failed to find or create user session'
                    };
                } finally {
                    if (commit) {
                        await ctx.commit();
                    }
                }
            });

            return SigVerificationResponseDTOSchema.parse({
                address: session.address,
                chainId: session.chainId,
            });
        } catch (error) {
            res.status(400);
            console.error(error);
            return { error: 'failed to verify signature' };
        }
    }


    @Get('session')
    async session(@Req() req, @Res({ passthrough: true }) res: Response) {
        //session cookie info
        const session = await this.sessionManager.getSession(req, res);
        const response: SebuSessionCookie = {
            address: session.address,
            chainId: session.chainId,
        }

        return response;
    }

    @Get('logout')
    async logout(@Req() req, @Res({ passthrough: true }) res: Response) {
        const session = await this.sessionManager.getSession(req, res);
        session.destroy();
    }
}
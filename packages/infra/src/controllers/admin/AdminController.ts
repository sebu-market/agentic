import { Controller, Logger, Post, Req, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "src/guards";
import { ACookieManager } from "src/services";
import { toErrorDTO } from "src/utils/error-utils";
import { ConfigService } from "@nestjs/config";

@Controller('admin')
export class AdminController {
    private readonly log: Logger = new Logger(AdminController.name);

    constructor(
        readonly config: ConfigService,
        readonly sessionManager: ACookieManager,
    ) { }

    @Post('advance-round')
    @UseGuards(AuthGuard)
    async advanceRound(
        @Req() req
    ) {
        const user = AuthGuard.getUser(req);
        if (!user) {
            return toErrorDTO("Unauthorized", 401);
        }

        // verify site admin
        const siteAdmins = this.config.get<string[]>('admin.siteAdmins');
        const isAdmin = siteAdmins.includes(user.user_wallet.toLowerCase());
        if (!isAdmin) {
            return toErrorDTO("Unauthorized", 401);
        }

        try {
        } catch (e: any) {
            this.log.error(e, e.stack);
            return toErrorDTO(e);
        }

    }

}
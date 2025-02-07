import type { AxiosInstance } from 'axios';
import axios from 'axios';
import autoBind from 'auto-bind';

// extensions
// IMPORTANT: don't forget to export the extension types!
import { AuthExtension } from "./extensions/auth/AuthExtension";
import { ProfilesExtension } from "./extensions/profiles/ProfilesExtension";
import { PitchesExtension } from './extensions/pitches/PitchesExtension';
import { RoundsExtension } from './extensions/rounds/RoundsExtension';
import { ScreeningsExtension } from './extensions/screenings/ScreeningsExtension';
// import { WebsocketsExtension } from './extensions/websockets/WebsocketsExtension';
import { PaymentSimulationExtension } from './extensions/payment-simulator/PaySimulatorExt';

export type SebuClientOptions = {
    httpEndpoint: string;
    wsEndpoint: string;
    // signature?: string;
}

// make all optional
export type PartialSebuClientOptions = Partial<SebuClientOptions>;

export class SebuClient {

    http: AxiosInstance;
    options: SebuClientOptions;

    // extensions
    auth: AuthExtension;
    profiles: ProfilesExtension;
    pitches: PitchesExtension;
    rounds: RoundsExtension;
    screenings: ScreeningsExtension;
    // websockets: WebsocketsExtension;
    paymentSimulation: PaymentSimulationExtension;

    static defaults: SebuClientOptions = {
        httpEndpoint: 'https://api.dev.sebu.market/v1',
        wsEndpoint: 'https://ws.api.dev.sebu.market/v1',
    } as const;

    constructor(options: PartialSebuClientOptions) {
        this.options = {
            ...SebuClient.defaults,
            ...options,
        };

        this.http = axios.create({
            baseURL: this.options.httpEndpoint,
            withCredentials: true,
            // headers: {
            //     'Authorization': 'Bearer ' + this.options.signature,
            // },
        });

        // extensions
        this.auth = new AuthExtension(this);
        this.profiles = new ProfilesExtension(this);
        this.pitches = new PitchesExtension(this);
        this.rounds = new RoundsExtension(this);
        this.screenings = new ScreeningsExtension(this);
        // this.websockets = new WebsocketsExtension(this);
        this.paymentSimulation = new PaymentSimulationExtension(this);

        autoBind(this);
    }

}
import { SebuClient } from "@sebu/client";

export const sebuClient = new SebuClient({
    httpEndpoint: import.meta.env.VITE_SEBU_HTTP_ENDPOINT,
    wsEndpoint: import.meta.env.VITE_SEBU_WS_ENDPOINT,
});
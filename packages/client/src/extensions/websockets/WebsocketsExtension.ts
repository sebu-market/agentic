import WebSocket from 'isomorphic-ws';
import { AClientExtension } from '../AClientExtension';
import { type SebuClient } from '../../SebuClient';

export class WebsocketsExtension extends AClientExtension {
    private ws: WebSocket;

    constructor(client: SebuClient) {
        super(client);
        this.ws = new WebSocket(this.client.options.wsEndpoint);
        // this.subscribe = this.subscribe.bind(this);

        this.ws.onopen = () => {
            console.log('connected');
            this.emit('open');
        }

        this.ws.onclose = () => {
            console.log('disconnected');
            this.emit('close');
        }

        this.ws.onerror = (error) => {
            console.error('error', error);
            this.emit('error', error);
        }


        this.ws.onmessage = (message) => {
            console.log('received', message);
            const event = JSON.parse(message.data.toString());
            console.log('received', event);
            this.emit('message', event);
        }
        
    }

    public send(event: any) {
        const message = JSON.stringify(event);
        this.ws.send(message);
    }

    // public subscribe(callback: (event: WebsocketEvent) => void) {
    //     console.log('subscribing');
    //     console.log(this.ws);
    //     this.ws.on('message', (message) => {
    //         const event = JSON.parse(message.toString());
    //         callback(event);
    //     });
    // }

    // public unsubscribe(callback: (event: WebsocketEvent) => void) {
    //     this.ws.off('message', callback);
    // }
}
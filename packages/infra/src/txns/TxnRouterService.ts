import { Injectable, Logger } from "@nestjs/common";
import { AddressLike, Interface, LogDescription } from "ethers";
import {SebuMasterABI} from '@sebu/smartcontracts';
import { ConfigService } from "@nestjs/config";
import { ContractAddresses } from "@sebu/dto";

export interface ITxnLogEvent {
    address: string;
    topics: string[];
    data: string;
}

export interface ILogDescription {
    log: LogDescription;
    address: string;
}

export interface ITxnInput {
    block_number: string; //numeric
    network: string; //numeric
    hash: string;
    status: boolean; //true success, false failure
    from: AddressLike;
    to: AddressLike;
    logs: ITxnLogEvent[];
    decodedLogs?: ILogDescription[];
    rawLogs?: ITxnLogEvent[]
}

export interface ITxnHandler {
    inboundTxn(txn: ITxnInput): Promise<void>;
}

interface IHandlerStruct {
    id: number;
    handler: ITxnHandler;
}

const transferABI = {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "_src",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "_dst",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "_amt",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
};

const TransferTopic = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

@Injectable()
export class TxnRouterService {

    handlerId: number = 0;
    subs: Map<string, IHandlerStruct[]> = new Map();
    ifc: Interface;
    log: Logger = new Logger(TxnRouterService.name);
    ofInterest: AddressLike[] = [];
    xferIfc: Interface = new Interface([transferABI]);
    
    constructor(
        readonly config: ConfigService
    ) {
        this.ifc = new Interface(SebuMasterABI);
        const chainId = +this.config.getOrThrow('rpc.chainId');
        this.ofInterest = [
            ContractAddresses[chainId].SebuMaster.toLowerCase(),
            ContractAddresses[chainId].Portfolio.toLowerCase(),
        ];
    }

    subscribe(events: string[], handler: ITxnHandler) {
        const id = this.handlerId++;
        for(const e of events) {
            const hs = this.subs.get(e) || [];
            hs.push({
                id,
                handler
            });
            this.subs.set(e.toLowerCase(), hs);
        }
    }

    async route(txn: ITxnInput): Promise<void> {
        let logs: ILogDescription[];
        let rawLogs: ITxnLogEvent[] = [];
        try {
            logs = txn.logs.map(log => {
                //only decode the contracts we know of or care about
                if(this.ofInterest.indexOf(log.address.toLowerCase()) >= 0) {
                    return {
                        address: log.address.toLowerCase(),
                        log: this.ifc.parseLog({topics: log.topics, data: log.data})
                    };
                } else if(log.topics[0] === TransferTopic) {
                    const decoded = this.xferIfc.parseLog({topics: log.topics, data: log.data});
                    return {
                        address: log.address.toLowerCase(),
                        log: new LogDescription(this.xferIfc.getEvent('Transfer'), TransferTopic, decoded.args)
                    }
                } else {
                    rawLogs.push(log);
                }
                return null;
            }).filter(l => l);
        } catch (e) {
            this.log.error({
                msg: "Problem decoding logs from txn",
                err: e
            });
            throw e;
        }
        txn.decodedLogs = logs;
        txn.rawLogs = rawLogs;

        //only call once if any of subscribed events hits
        const called: Map<number, boolean> = new Map();
        try {
            const promises: Promise<void>[] = [];
            logs.forEach(log => {
                const hs = this.subs.get(log.log.name.toLowerCase());
                if(hs) {
                    hs.forEach(h => {
                        if(!called.has(h.id)) {
                            called.set(h.id, true);
                            promises.push(h.handler.inboundTxn(txn));
                        }
                    });
                } else {
                    this.log.log({
                        msg: "No handler for log",
                        log: log.log.name
                    });
                }
            });
            await Promise.all(promises);
        } catch (error) {
            this.log.error({
                msg: "Problem handling txn",
                err: error
            });
            throw error;
        }
    }
}
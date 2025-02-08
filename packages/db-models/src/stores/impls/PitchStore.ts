import { EntityManager } from "@mikro-orm/core";
import { Pitch, SebuUser } from "../../models";
import { BaseStore } from "./BaseStore";
import { StoreContext } from "./StoreContext";
import { APitchStore, ISimilarPitch } from "../interfaces";
import { PitchStatus } from "@sebu/dto";

export class PitchStore extends BaseStore<Pitch> implements APitchStore {

    constructor(
        readonly em: EntityManager,
        readonly ctx: StoreContext
    ) {
        super(em, Pitch);
    }

    async findActivePitch(): Promise<Pitch| null> {
        return this.em.findOne(Pitch, {status: PitchStatus.LIVE}, {populate: ['conversation']});
    }
    async findBySlot(slot: number): Promise<Pitch | null> {
        return this.em.findOne(Pitch, { payment: {
            slotNumber: slot
        }}, {populate: ['conversation']});
    }

    async findByOnChainPitchId(onChainPitchId: number): Promise<Pitch | null> {
        return this.em.findOne(Pitch, { onChainPitchId }, {populate: ['conversation']});
    }

    async findUnresolvedPaidPitch(user: SebuUser): Promise<Pitch | null> {
        return this.em.findOne(Pitch, { 
            owner: user, 
            payment: {
                amount: { $gt: 0 },
            }, 
            screeningId: { $lt: 0} 
        }, {populate: ['conversation']});
    }

    async findSimilarPitch(vector: number[], minScore: number): Promise<ISimilarPitch[]> {
        /**
         * Use the vectortype column (embedding) of pitchsummary table to find pitches of a similar
         * nature. Get the similarity score as part of the result.
         * 
         * Use the entitymanager (postgres) to create a query builder. Then create a custom
         * query that find similar pitches
         */
        const query = `
            with simcheck as (
                select id, 1 - (embedding <=> '[${vector}]') as similarity
                FROM pitch
            )
            select id, similarity from simcheck
            where similarity > ${minScore}
            order by similarity desc
            limit 5
        `;

        const result = await this.em.getConnection().execute(query);
        return result.map((row: any) => ({
            id: row.id,
            similarity: row.similarity
        } as ISimilarPitch));
    }

    async rankPitchesInCurrentRound(): Promise<Pitch[]> {
        /**
         * 1) find highest round in pitch payments
         * 2) find all pitches in that round that have been evaluated
         * 3) rank them by score
         * 4) return the top 5
         */
        const sample = await this.em.findOne(Pitch, {
            status: PitchStatus.EVALUATED
        }, {
            orderBy: [
                { payment: { roundNumber: 'desc' } }
            ]
        });
        if (!sample) {
            return [];
        }
        const players = await this.em.find(Pitch, {
            status: PitchStatus.EVALUATED,
            payment: {
                roundNumber: sample.payment.roundNumber
            }
        }, {
            orderBy: [
                { evaluation: { moonPotentialScore: 'desc' } }
            ],
            populate: ['tokenMetadata', 'payment', 'evaluation', 'founderInfo', 'owner.id', 'owner.user_wallet'],
            limit: 5
        });
        return players;
    }
}
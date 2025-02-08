import { Pitch, SebuUser } from "../../models";
import { ABaseStore } from "./ABaseStore";

export interface ISimilarPitch {
    id: number,
    description: string,
    similarity: number
}

export abstract class APitchStore extends ABaseStore<Pitch> {

    abstract findActivePitch(): Promise<Pitch|null>;
    abstract findBySlot(slot: number): Promise<Pitch|null>;
    abstract findByOnChainPitchId(onChainPitchId: number): Promise<Pitch|null>;
    abstract findUnresolvedPaidPitch(user: SebuUser): Promise<Pitch|null>;
    abstract findSimilarPitch(vector: number[], minScore: number): Promise<ISimilarPitch[]>;
    abstract rankPitchesInCurrentRound(): Promise<Pitch[]>;
    
}
import { Pitch } from "@sebu/db-models";

export abstract class APitchSummarizer {

    abstract summarizePitch(pitch: Pitch): Promise<void>;
}
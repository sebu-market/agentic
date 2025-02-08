import { Screening } from "@sebu/db-models";

export abstract class AScreeningSummarizer {
    abstract summarize(screening: Screening): Promise<void>;
}
import { Entity, OneToOne } from "@mikro-orm/core";
import { BaseSession } from "./BaseSession";
import { Pitch } from "./Pitch";

@Entity()
export class Screening extends BaseSession {

    @OneToOne(() => Pitch, {
        nullable: true
    }, {
        orphanRemoval: true
    })
    followOnPitch: Pitch;
}
import { Embeddable, Property } from "@mikro-orm/core";

@Embeddable()
export class FounderInfo {

    @Property()
    name: string;

    @Property()
    role: string;

    @Property()
    socialMedia: string;
}
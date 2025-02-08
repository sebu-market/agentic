import { Embeddable, Property } from "@mikro-orm/core";

@Embeddable()
export class ProjectSummary {

    @Property({type: 'text', nullable: true})
    description?: string;

    @Property({
        nullable: true
    })
    projectName: string;

    @Property({type: 'float', nullable: true})
    duplicateScore: number;

    @Property({nullable: true})
    duplicateName: string;

    @Property({type: 'text', nullable: true})
    duplicateDescription: string;

}
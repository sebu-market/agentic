import { IOrganizationDTO } from "@razr/dto";
import { useSession } from "@/queries/auth";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";

export interface DisplayOrganizationProps {
    organization: IOrganizationDTO;
    asLink?: boolean;
}

// FIXME: remove this componenet
export function DisplayOrganization(props: DisplayOrganizationProps) {
    const session = useSession();
    const {
        asLink = true,
        organization
    } = props;

    if (!organization) {
        return null;
    }

    const canEdit = false; // session?.id === organization.ownerId;

    const text = (
        <>{organization.name}</>
    );

    const nav = useNavigate();
    const goToEdit = () => {
        nav({to: `/organizations/${organization.id}/edit`});
    }

    if(canEdit) {
        return (
            <div className="grid grid-cols-2 gap-2">
                <div className="col-span-1 text-left">{text}</div>
                <div className="col-span-1 text-right">
                    <Button variant="link" onClick={goToEdit}>Edit</Button>
                </div>
            </div>
        )
    }

    return (
        <span>{text}</span>
    );
}
import { useSession } from "@/queries/auth";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "@tanstack/react-router";

type LocationItem = {
    label: string;
    path: string;
}

const actionsMap: Record<string, LocationItem> = {
    '/organizations': {
        label: 'Create Org',
        path: '/organizations/create'
    }
}

export function LocationSpecificActions() {
    const location = useLocation();
    const navigate = useNavigate();

    const session = useSession();

    const locationItem = actionsMap[location.pathname];
    if (!locationItem) {
        return null;
    }

    const onClick = () => {
        navigate({ to: locationItem.path });
    }
   
    if(session) {
        return (
            <Button className='mx-2' size={'sm'} onClick={onClick}>{locationItem.label}</Button>
        )
    }
    return null;
}

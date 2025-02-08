// import { useOrgList } from "@/api/queries/org";
// import { OrganizationList } from "./features/organization-list";

import { Sidebar } from "@/pages/screenings/features/sidebar";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export interface PitchesSignupPageProps {
    id?: number;
}

export function PitchesSignupPage(_: PitchesSignupPageProps) {

    // const organizationQuery = useOrgList();

    // if (organizationQuery.isLoading) {
    //     return <div>Loading...</div>
    // }

    // if (organizationQuery.isError) {
    //     return <div>Error: {organizationQuery.error.message}</div>
    // }

    // const organizations = organizationQuery.data?.data || []; // organizationQuery.data?.results || [];


    return (
        <div className='grid grid-cols-12 gap-4'>
            <div className='col-span-3'>
                <Sidebar />
            </div>
            <div className='col-span-9'>
                <div className='flex items-center pb-4'>
                    <Breadcrumb className='grow' />
                    <h1>
                        PitchesSignupPage
                    </h1>
                </div>
            </div>


        </div>
        // <OrganizationList organizations={organizations} />
    )
}
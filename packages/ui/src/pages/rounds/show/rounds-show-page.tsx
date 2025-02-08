// import { useOrgList } from "@/api/queries/org";
// import { OrganizationList } from "./features/organization-list";

import { Sidebar } from "@/pages/screenings/features/sidebar";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { usePitches, usePitchLeaders } from "@/queries/pitches";
import Leaderboard, { LeaderboardItem } from "@/components/sebu/leaderboard";
import { PitchStatus } from "@sebu/dto";

export interface RoundsShowPageProps {
    id?: number;
}

export function RoundsShowPage(_: RoundsShowPageProps) {
    const pitchesQuery = usePitches();
    const pitches = pitchesQuery.data?.results || [];

    const leaderboard: LeaderboardItem[] = [];
    const leaders = usePitchLeaders();
    console.log('leaders', leaders.data);

    for (const pitch of leaders?.data?.results || []) {
        if (pitch.status === PitchStatus.EVALUATED) {
            leaderboard.push({
                title: `${pitch.projectSummary?.projectName || ("Pitch: " + pitch.id)}`,
                score: pitch.finalEval?.moonPotentialScore || 0,
            });
        }
    }

    return (
        <div className='grid grid-cols-12 gap-4'>
            <div className='col-span-3'>
                <Sidebar />
            </div>
            <div className='col-span-9'>
                <div className='flex items-center pb-4'>
                    <Breadcrumb className='grow' />
                    <Leaderboard data={leaderboard} />
                </div>
            </div>


        </div>
        // <OrganizationList organizations={organizations} />
    )
}
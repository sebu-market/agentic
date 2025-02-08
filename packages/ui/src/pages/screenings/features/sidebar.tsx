import { CurrencyFormatter } from "@/components/formatting/currency-formatter"
import { RelativeDate } from "@/components/formatting/relative-date"
import { Button } from "@/components/ui/button"
import { PitchMetadata, PitchStatus, ScreeningMetadata } from "@sebu/dto"
import { cn } from "@/lib/utils"
import { useCurrentRound } from "@/queries/rounds"
import { usePitches } from "@/queries/pitches";
import { useNavigate } from '@tanstack/react-router'
import { ScreeningSummary } from "./screening-summary"
import { useCreateScreening, useScreening, useScreenings, useSendScreeningMessage } from "@/queries/screenings"
import React from "react"
import { Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { PitchSummary } from "./pitch-summary"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAccount } from "wagmi";
import { useModal, useSIWE } from "connectkit"


export type SidebarProps = React.HTMLAttributes<HTMLDivElement> & {

}

const pitchStatusPriority: Record<PitchStatus, number> = {
  [PitchStatus.LIVE]: 90,
  [PitchStatus.QUEUED]: 80,
  [PitchStatus.COMPLETED]: 70,
  [PitchStatus.EVALUATED]: 60,
  [PitchStatus.PENDING_PAYMENT]: 0,
} as const;


export function Sidebar({ className }: SidebarProps) {
  const navigate = useNavigate();
  const { isSignedIn } = useSIWE();
  const { setOpen } = useModal();

  const currentRoundQuery = useCurrentRound();
  const round = currentRoundQuery.data;

  const screeningsQuery = useScreenings({ isSignedIn });
  const pitchesQuery = usePitches(round?.id);
  const createScreening = useCreateScreening();
  const sendMessage = useSendScreeningMessage();

  const [isStarting, setIsStarting] = React.useState(false);

  const startScreening = async () => {
    if (isStarting) return;
    setIsStarting(true);

    if (!isSignedIn) {
      setOpen(true);
      setIsStarting(false);
      return;
    }

    try {
      const screening = await createScreening.mutateAsync();

      sendMessage.mutate({
        content: '<user has entered the room>',
        sessionId: screening.id,
      });

      navigate({ to: '/screenings/$id', params: { id: screening.id.toString() } })

    } catch (e) {
    } finally {
      setIsStarting(false);
    }


    setIsStarting(false);
  };

  if (currentRoundQuery.isLoading) {
    return (
      <div className="text-center">
        Loading...
      </div>
    )
  }

  if (currentRoundQuery.isError) {
    return (
      <div className="text-center">
        Error loading round
      </div>
    )
  }


  if (!round) {
    return (
      <div className="text-center">
        No active round
      </div>
    )
  }


  if (pitchesQuery.isLoading) {
    return (
      <div className="text-center">
        Loading...
      </div>
    )
  }

  if (pitchesQuery.isError) {
    return (
      <div className="text-center">
        Error loading pitches
      </div>
    )
  }

  let screenings = screeningsQuery.data?.results || [];
  screenings.sort((a: ScreeningMetadata, b: ScreeningMetadata) => {
    return b.id - a.id;
  });

  let pitches = pitchesQuery.data?.results || [];

  // filter any waiting for payment
  pitches = pitches.filter(p => p.status !== PitchStatus.PENDING_PAYMENT);

  // sort pitches by status + date
  pitches.sort((a: PitchMetadata, b: PitchMetadata) => {
    const aPriority = pitchStatusPriority[a.status] || 999;
    const bPriority = pitchStatusPriority[b.status] || 999;
    const priResult = bPriority - aPriority;

    if (priResult !== 0) {
      return priResult;
    }

    return b.id - a.id;
  });


  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="py-2">
          <h2 className="text-lg font-semibold tracking-tight">
            Investment Round
          </h2>
          <p className="text-sm font-normal text-gray-500">
            Ending <RelativeDate value={round.endsAt} />
          </p>

          <h2 className="text-md font-semibold tracking-tight pt-4">
            Capital Allocation
          </h2>

          <p>
            Round Size:
            &nbsp;
            <CurrencyFormatter
              decimals={0}
              value={round.valueUSD}
            />
          </p>

          <Button variant="secondary" size={'sm'}>Invest in Round</Button>



          <h2 className="mt-2 text-lg font-semibold tracking-tight pt-4">
            Pitches
          </h2>

          <ScrollArea className="h-[100px]">
            <ul>
              {pitches.map(pitch => (
                <li key={pitch.id}>
                  <PitchSummary pitch={pitch} />
                </li>
              ))}
            </ul>
          </ScrollArea>
          {isStarting ? (
            <Button
              variant="secondary"
              disabled
            >
              <Loader2 className="animate-spin" />
              Please wait
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={() => startScreening()}
            >
              Signup to Pitch!
            </Button>
          )}

          {isSignedIn && screenings.length > 0 && (
            <div>
              <h2 className="mt-2 text-lg font-semibold tracking-tight pt-4">
                Screening History <span className="text-sm font-normal text-gray-500">(Private)</span>
              </h2>

              <ScrollArea className="h-[100px]">
                <ul>
                  {screenings?.map((screening) => (
                    <li key={screening.id}>
                      <ScreeningSummary screening={screening} />
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
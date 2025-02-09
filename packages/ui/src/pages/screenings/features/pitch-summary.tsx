import { Badge } from '@/components/ui/badge';
import { Link } from '@tanstack/react-router'
import { PitchMetadata, PitchStatus } from '@sebu/dto';

export type ScreeningSummaryProps = {
  pitch: PitchMetadata;
}

export function PitchSummary({ pitch }: ScreeningSummaryProps) {
  let title = `Pitch ${pitch.id}`;
  if (pitch.tokenMetadata) {
    title = `${pitch.tokenMetadata.name} (${pitch.tokenMetadata.symbol})`;
  }

  let subtitle = '';
  if (pitch.status === PitchStatus.COMPLETED || pitch.status === PitchStatus.EVALUATED) {
    subtitle = `(${pitch.status.toLocaleLowerCase()})`;
  } else if (pitch.status === PitchStatus.QUEUED) {
    subtitle = `(${pitch.status.toLocaleLowerCase()})`;
  }

  return (
    <>
      <Link
        to={`/pitches/$id`}
        params={{ id: pitch.id.toString() }}
        activeProps={{ className: 'font-bold text-blue-500' }}
      >
        {title}
        {pitch.status === PitchStatus.LIVE && (
          <Badge variant={'destructive'} className='ml-1'>LIVE</Badge>
        )}
      </Link>
      &nbsp;
      <span className="text-gray-500">
        {subtitle}
      </span>
    </>
  )

}
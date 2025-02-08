import { Link } from '@tanstack/react-router';
import { ScreeningMetadata, ScreeningStatus } from '@sebu/dto';

export type ScreeningSummaryProps = {
  screening: ScreeningMetadata;
}

export function ScreeningSummary({ screening }: ScreeningSummaryProps) {
  let title = `Screening ${screening.id}`;
  if (screening.tokenMetadata) {
    title = `${screening.tokenMetadata.name} (${screening.tokenMetadata.symbol})`;
  }

  let subtitle = '';
  if (screening.status === ScreeningStatus.ACCEPTED || screening.status === ScreeningStatus.REJECTED) {
    subtitle = `(${screening.status.toLocaleLowerCase()})`;
  }

  return (
    <>
      <Link
        to={`/screenings/$id`}
        params={{ id: screening.id.toString() }}
        activeProps={{ className: 'font-bold text-blue-500' }}
      >
        {title}
      </Link>
      &nbsp;
      <span className="text-gray-500">
        {subtitle}
      </span>
    </>
  )

}
import { 
  formatDistanceStrict,
  parseISO
} from "date-fns";

export type RelativeDateProps = {
  value: Date | string,
  now?: Date,
}

export function RelativeDate(props: RelativeDateProps) {

  const value = props.value instanceof Date ? props.value : parseISO(props.value);

  const now = props.now || new Date();
  const formatted = formatDistanceStrict(
    value,
    now,
    {
      addSuffix: true,
    }
  );

  return (
    <>
      {formatted}
    </>
  )

}
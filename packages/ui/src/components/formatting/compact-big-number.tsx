export type CompactBigNumberProps = {
    value: bigint | number | string;
};

const formatter = new Intl.NumberFormat('en', { 
    notation: "compact", 
    compactDisplay: "short",
    maximumFractionDigits: 1,
})

export function CompactBigNumber({ value }: CompactBigNumberProps) {
    let asBigint = BigInt(value);
    const formatted = formatter.format(asBigint);
    return formatted;
}
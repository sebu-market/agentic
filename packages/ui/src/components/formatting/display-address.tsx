export  function DisplayAddress({
    address,
}: {
    address: string;
}) {

    return (
        <span className="inline-flex items-center whitespace-nowrap">
            <span>{address}</span>
        </span>
    )
}
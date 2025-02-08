import { cn } from '@/lib/utils';
import { TokenIcon } from '../token-icon';
import { ITokenDTO } from '@razr/dto';

export interface TokenNameProps {
    token: ITokenDTO;
    asLink?: boolean;
    showIcon?: boolean;
    showSymbol?: boolean;
    showName?: boolean;
}

export function DisplayToken(props: TokenNameProps) {
    const {
        asLink = true,
        showIcon = true,
        showSymbol = true,
        showName = true,
        token
    } = props;

    if (!token) {
        return null;
    }

    const muteSymbol = showName == true;

    const text = (
        <>
            {showIcon && <TokenIcon token={token} />}
            {showName && <span className="ml-1">{token.name}</span>}
            {showSymbol &&
                <span className={cn(
                    muteSymbol && 'text-muted-foreground',
                    'pl-1'
                )}>{token.symbol}</span>}
        </>
    );

    return (
        <span className="inline-flex items-center whitespace-nowrap">

            {asLink ? (
                <a className="hover:underline" href={`/tokens/${token.id}`}>{text}</a>
            ) : (
                <span>{text}</span>
            )}

        </span>
    )

}

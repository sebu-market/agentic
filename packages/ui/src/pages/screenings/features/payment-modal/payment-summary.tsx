import { CurrencyFormatter } from "@/components/formatting/currency-formatter";
import {
    Table,
    TableBody,
    TableCell,
    TableRow
} from "@/components/ui/table";
import { ScreeningMetadata } from "@sebu/dto";
import { TransactionPlan } from "./transaction-wizard";

export type PaymentButtonProps = {
    screening: ScreeningMetadata;
    txnPlan: TransactionPlan;
}

export function PaymentSummary(props: PaymentButtonProps) {

    const { screening, txnPlan } = props;

    const { feeToken, pitchFee } = txnPlan;


    return (
        <>
            <Table>
                <TableBody>

                    <TableRow key={'slot-number'}>
                        <TableCell className="font-medium">Fee Token</TableCell>
                        <TableCell className="text-right">{feeToken?.symbol}</TableCell>
                    </TableRow>

                    <TableRow key={'amount'}>
                        <TableCell className="font-medium">Pitch Cost</TableCell>
                        <TableCell className="text-right">
                            <CurrencyFormatter
                                decimals={feeToken.decimals}
                                value={pitchFee || 0} />
                        </TableCell>
                    </TableRow>

                </TableBody>

            </Table>
        </>
    )
}

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { PitchMetadata } from "@sebu/dto";



type PitchEval = {
    apingIn: boolean;
    score: number;
    moonPotentialScore: number;
    bullishFactors: string[];
    redFlags: string[];
}


export function FinalEval({ pitch }: { pitch: PitchMetadata }) {

    const evaluation = pitch.finalEval as PitchEval;
    if (!evaluation) {
        return null;
    }

    return (
        <Card className="my-4">
            <CardHeader>
                <CardTitle>Final Evaluation</CardTitle>
                <CardDescription></CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h4 className='font-semibold'>Would you ape into this project?</h4>
                        <p>{evaluation.apingIn ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                        <h4 className='font-semibold'>Score</h4>
                        <p>{evaluation.moonPotentialScore || evaluation.score}</p>
                    </div>
                    <div>
                        <h4 className='font-semibold'>Bullish Factors</h4>
                        <ul>
                            {evaluation.bullishFactors.map((factor: string, i: number) => (
                                <li key={i}>{factor}</li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className='font-semibold'>Red Flags</h4>
                        <ul>
                            {evaluation.redFlags.map((flag: string, i: number) => (
                                <li key={i}>{flag}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
            </CardFooter>
        </Card>
    )
}
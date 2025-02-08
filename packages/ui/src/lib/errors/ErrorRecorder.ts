import { useToast } from "@/hooks/use-toast";
import { LoggerFactory } from '@/utils/logger';
import { IError } from "./IError";

type ErrorRecorderCaptureInput = {
    title?: string;
    description?: string;
    error: IError;
}

export class ErrorRecorder {

    private log = LoggerFactory.getInstance({ name: 'ErrorRecorder' });

    capture(input: ErrorRecorderCaptureInput) {
        const { error } = input;
        const originalTitle = input.title;
        const title = originalTitle || this.buildTitle(error);
        const description = input.description || this.buildDescription(error);

        const { toast } = useToast();

        toast({
            title,
            description,
            duration: 10_000,
            variant: 'destructive',
        });

        this.log.error({
            msg: originalTitle,
            err: error,
        });

    }

    protected buildTitle(err: IError) {
        return err.code ?
            `Error: ${err.code}` :
            'Error';
    }

    protected buildDescription(err: IError) {
        return err.message;
    }

}
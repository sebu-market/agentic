
export abstract class ASSMService {
  abstract getParameter(name: string, required?: boolean): Promise<string>;
  abstract setParameter(name: string, value: string, overwrite?: boolean): Promise<any>;
}
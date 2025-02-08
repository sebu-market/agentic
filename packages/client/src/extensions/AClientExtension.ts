import autoBind from 'auto-bind';
import { type SebuClient } from "../SebuClient";
import { EventEmitter } from 'eventemitter3';
import { z } from 'zod';


export type DataWithValidator = {
    data: unknown,
    validator?: z.ZodTypeAny,
}

export type BaseRequestOptions<T> = {
    path: string,
    params?: DataWithValidator,
    body?: DataWithValidator,
    responseValidator: z.ZodTypeAny | null,
}

export abstract class AClientExtension extends EventEmitter {
    constructor(protected client: SebuClient) {
        super();
        autoBind(this);
    }

    protected validate<T>(
        validator: z.ZodTypeAny,
        data: unknown
    ): T {
        const parsed = validator.parse(data) as T;

        return parsed;
    }

    protected processRouteParams(
        path: string,
        params: Record<string, string>
    ): {
        params: Record<string, string>,
        routeParams: Record<string, string>,
        path: string,
    } {
        const newParams = { ...params };
        const routeParams: Record<string, string> = {};
        let newPath = path;

        Object.entries(params).forEach(([key, value]) => {
            if (path.includes(`:${key}`)) {
                routeParams[key] = value;
                delete newParams[key];
                newPath = newPath.replace(`:${key}`, value);
            }
        });

        return {
            params: newParams,
            routeParams,
            path: newPath,
        };
    }

    protected async postWithValidation<T>(
        options: BaseRequestOptions<T>
    ): Promise<T> {
        return await this.requestWithValidation<T>({
            method: 'post',
            ...options,
        });
    }

    protected async putWithValidation<T>(
        options: BaseRequestOptions<T>
    ): Promise<T> {
        return await this.requestWithValidation<T>({
            method: 'put',
            ...options,
        });
    }

    protected async getWithValidation<T>(
        options: BaseRequestOptions<T>
    ): Promise<T> {
        return await this.requestWithValidation<T>({
            method: 'get',
            ...options,
        });
    }

    protected async deleteWithValidation<T>(
        options: BaseRequestOptions<T>
    ): Promise<T> {
        return await this.requestWithValidation<T>({
            method: 'delete',
            ...options,
        });
    }

    private extractParams(options: BaseRequestOptions<unknown>): Record<string, string> {
        let params = {};

        if (typeof options.params?.data === 'object') {
            params = { ...options.params.data };
        }

        return params;
    }

    protected async requestWithValidation<T>(
        options: BaseRequestOptions<T> & { method: string, }
    ): Promise<T> {

        let allParams = this.extractParams(options);
        if (options.params?.validator) {
            try {
                allParams = this.validate(options.params.validator, allParams) as any;
            } catch (e) {
                console.log({
                    msg: 'Error validating request params',
                    req: options,
                    params: allParams,
                    err: e,
                });

                throw e;
            }
        }

        const { params, path } = this.processRouteParams(options.path, allParams);

        let body = options.body?.data;
        if (options.body?.validator) {
            try {
                body = this.validate(options.body.validator, body);
            } catch (e) {
                console.log({
                    msg: 'Error validating request body',
                    req: options,
                    body,
                    err: e,
                });

                throw e;
            }
        }

        const response = await this.client.http.request({
            url: path,
            method: options.method,
            data: body,
            params,
        });

        let output = response.data;

        // FIXME:
        // check if we have a `error` field- if so, throw an custom error


        if (options.responseValidator) {
            try {
                output = this.validate<T>(options.responseValidator, response.data);
            } catch (e) {
                console.log({
                    msg: 'Error validating response',
                    req: options,
                    res: response.data,
                    err: e,
                });

                throw e;
            }
        }

        return output;
    }


}
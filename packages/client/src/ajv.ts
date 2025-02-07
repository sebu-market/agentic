import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { Type } from '@sinclair/typebox';

const ajv = addFormats(new Ajv({
    coerceTypes: true,
    strict: true,
}), [
    'date-time',
    'time',
    'date',
    'email',
    'hostname',
    'ipv4',
    'ipv6',
    'uri',
    'uri-reference',
    'uuid',
    'uri-template',
    'json-pointer',
    'relative-json-pointer',
    'regex'
]);

addFormats(ajv, { mode: "fast" });

export { ajv };


export const PaginationSchema = Type.Object({
    page: Type.Optional(
        Type.Integer({
            minimum: 1,
            default: 1,
        })
    ),
    limit: Type.Optional(
        Type.Integer({
            minimum: 1,
            maximum: 100,
            default: 10,
        }),
    ),
    sort: Type.Optional(
        Type.String({
            pattern: '^[a-zA-Z0-9_]+$',
        }),
    ),
    order: Type.Optional(
        Type.Union([
            Type.Literal('asc'),
            Type.Literal('desc'),
        ]),
    ),
});

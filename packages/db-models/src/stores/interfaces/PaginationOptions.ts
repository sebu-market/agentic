
export type PaginationOptions = {
    offset?: number;
    limit?: number;
    sort?: {
        field: string;
        order: 'ASC' | 'DESC';
    }
}
export interface PaginationOptions{
    page?:number;
    limit?:number;
}

export interface PaginationResult{
    page: number;
    limit: number;
    skip: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export interface PaginatedResponse<T>{
    products: T[],
    pagination: PaginationResult
}

export function getPaginationParams(query: any): {page: number, limit: number; skip: number} {
    let page = parseInt(query.page) || 1;
    let limit = parseInt(query.limit) || 100;

    if(page < 1) page = 1;
    if(limit < 1) limit = 10;
    if(limit > 100) limit = 100;

    const skip = (page - 1) * limit;

    return {page, limit, skip};
}

export function createPaginationResult(
    page: number,
    limit: number,
    totalItems: number
): PaginationResult {
    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    const skip = (page - 1 ) * limit;

    return{
        page,
        limit,
        skip,
        totalPages,
        totalItems,
        hasNextPage,
        hasPrevPage,
    };
}

export function createPaginationResponse<T>(
    products: T[],
    page: number,
    limit: number,
    totalItems: number
): PaginatedResponse<T>{
    const pagination = createPaginationResult(page, limit, totalItems);

    return {
        products,
        pagination
    }
}
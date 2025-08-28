export class PaginationUtil {
    static readonly DEFAULT_PAGE = 1;
    static readonly DEFAULT_LIMIT = 20;
    static readonly MAX_LIMIT = 100;

    static getPaginationParams(query: any): { page: number; limit: number } {
        const page = Math.max(1, parseInt(query.page) || this.DEFAULT_PAGE);
        const limit = Math.min(
            this.MAX_LIMIT,
            Math.max(1, parseInt(query.limit) || this.DEFAULT_LIMIT)
        );

        return { page, limit };
    }

    static paginate<T>(
        data: T[],
        total: number,
        page: number,
        limit: number,
    ) {
        const totalPages = Math.ceil(total / limit);
        const hasNext = page < totalPages;
        const hasPrev = page > 1;

        return {
            data,
            pagination: {
                total,
                page,
                limit,
                totalPages,
                hasNext,
                hasPrev,
            },
        };
    }

    static getSkip(page: number, limit: number): number {
        return (page - 1) * limit;
    }
}
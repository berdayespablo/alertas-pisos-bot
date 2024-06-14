export class URLBuilder {
    private baseUrl: string;
    private area: string;
    private filters: string[];

    constructor(baseUrl: string, area: string) {
        this.baseUrl = baseUrl;
        this.area = area;
        this.filters = [];
    }

    addFilter(filter: string): URLBuilder {
        this.filters.push(filter);
        return this;
    }

    addValueFilter(filter: string, value: number): URLBuilder {
        this.filters.push(`${filter}${value}`);
        return this;
    }

    addFilters(options: {
        priceMin?: number,
        priceMax?: number,
        metersMin?: number,
        metersMax?: number,
        publishDate?: string,
        type?: string[],
        numRooms?: string[],
        numBathrooms?: string[],
        conditions?: string[],
        features?: string[]
    }): URLBuilder {
        if (options.priceMin !== undefined) {
            this.addValueFilter('precio-desde_', options.priceMin);
        }
        if (options.priceMax !== undefined) {
            this.addValueFilter('precio-hasta_', options.priceMax);
        }
        if (options.metersMin !== undefined) {
            this.addValueFilter('metros-cuadrados-mas-de_', options.metersMin);
        }
        if (options.metersMax !== undefined) {
            this.addValueFilter('metros-cuadrados-menos-de_', options.metersMax);
        }
        if (options.publishDate !== undefined) {
            this.addFilter(options.publishDate);
        }
        if (options.type !== undefined) {
            options.type.forEach(type => this.addFilter(type));
        }
        if (options.numRooms !== undefined) {
            options.numRooms.forEach(room => this.addFilter(room));
        }
        if (options.numBathrooms !== undefined) {
            options.numBathrooms.forEach(bathroom => this.addFilter(bathroom));
        }
        if (options.conditions !== undefined) {
            options.conditions.forEach(condition => this.addFilter(condition));
        }
        if (options.features !== undefined) {
            options.features.forEach(feature => this.addFilter(feature));
        }
        return this;
    }

    build(): string {
        const filtersPart = this.filters.length ? `con-${this.filters.join(',')}` : '';
        return `${this.baseUrl}${filtersPart}${this.area}`;
    }
}

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
        const mappings: { [key: string]: (value: any) => void } = {
            priceMin: (value: number) => this.addValueFilter('precio-desde_', value),
            priceMax: (value: number) => this.addValueFilter('precio-hasta_', value),
            metersMin: (value: number) => this.addValueFilter('metros-cuadrados-mas-de_', value),
            metersMax: (value: number) => this.addValueFilter('metros-cuadrados-menos-de_', value),
            publishDate: (value: string) => this.addFilter(value),
            type: (value: string[]) => value.forEach(type => this.addFilter(type)),
            numRooms: (value: string[]) => value.forEach(room => this.addFilter(room)),
            numBathrooms: (value: string[]) => value.forEach(bathroom => this.addFilter(bathroom)),
            conditions: (value: string[]) => value.forEach(condition => this.addFilter(condition)),
            features: (value: string[]) => value.forEach(feature => this.addFilter(feature))
        };

        Object.entries(options).forEach(([key, value]) => {
            if (value !== undefined && mappings[key]) {
                mappings[key](value);
            }
        });

        return this;
    }

    build(): string {
        const filtersPart = this.filters.length ? `con-${this.filters.join(',')}` : '';
        return `${this.baseUrl}${filtersPart}${this.area}`;
    }
}


export interface Product {
	id: string;
	name: string;
	category?: string;
	brand?: string;
}

export interface SearchResult {
	exact: Product | null;
	similars: Product[];
}


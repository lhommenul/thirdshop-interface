import { useEffect, useState } from "react";
import type { Product } from "../type/ProductSearch";
import type { TupleResult } from "../../../shared/type/Turple";
import { pubSub } from "../../../shared/store/pubSub";

type SearchBarParams = {
    query: string;
    products: Product[];
}

export function useSearchBar() {

    const [query, setQuery] = useState("");
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        initialize();
    }, []);

    function initialize() {
        pubSub.on("search-bar:search", async ( params: SearchBarParams ) => {
            setQuery(params.query);
            setLoading(true);
            setError(null);
    
            const [err, data] = await search(params);
            if (err) {
                setError(err);
            } else {
                setProducts(data ?? []);
            }
            setLoading(false);
    
        });

    }

    const search = async ( params: SearchBarParams ): Promise<TupleResult<Product[]>> => {

        try {

            const response = await fetch("/data/products.json", {
                headers: { "cache-control": "no-cache" },
                // body: JSON.stringify(params),
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const products = (await response.json()) as Product[];

            if (!Array.isArray(products)) throw new Error("Les produits ne sont pas un tableau");

            return [null, products];
            
        } catch (error) {

            const err = error instanceof Error ? error : new Error("Une erreur est survenue");
            
            return [err, null];
            
        }

    }

    return {
        query,
        products,
        loading,
        error,
        search,
    }
	
}
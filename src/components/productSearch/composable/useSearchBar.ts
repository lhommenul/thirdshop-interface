import { useEffect, useState } from "react";
import type { Product } from "../type/ProductSearch";
import type { TupleResult } from "../../../shared/type/Turple";
import { EventKey, pubSub } from "../../../shared/store/pubSub";
import type { Cara } from "../ui/ProductCharacteristics";

type SearchBarParams = {
    query?: string;
    characteristics?: Cara[];
    suggestions?: string[];
}

type SearchBarResults = {
    products: Product[];
}

export function useSearchBar() {

    const [state, setState] = useState<SearchBarParams>({
        query: "",
        characteristics: [],
        suggestions: [],
    });

    const [results, setResults] = useState<SearchBarResults>({
        products: [],
    });

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        initialize();
    }, []);

    function initialize() {
        
        pubSub.on(EventKey.SEARCH_BAR_SEARCH, async ( params: SearchBarParams ) => {
            
            setState({
                query: params.query ?? state.query,
                characteristics: Array.from(new Set([...(state.characteristics ?? []), ...(params.characteristics ?? [])])),
                suggestions: params.suggestions ?? state.suggestions,
            });

            console.log(Array.from(new Set([...(state.characteristics ?? []), ...(params.characteristics ?? [])])));

            setLoading(true);
            setError(null);
    
            const [err, data] = await search(params);
            if (err) {
                setError(err);
            } else {

                const filteredProducts = data.filter(( product ) => {
                    if (!state.query) return true;
                    return product.brand?.includes(state.query) || product.name.includes(state.query) || product.category?.includes(state.query);
                })

                setResults({
                    products: filteredProducts ?? [],
                });
                setError(null);
            }
            setLoading(false);
    
        });

    }

    function reset() {
        setState({
            query: "",
            characteristics: [],
        });
        setLoading(false);
        setError(null);
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
        state,
        results,
        loading,
        error,
        search,
        reset
    }
	
}
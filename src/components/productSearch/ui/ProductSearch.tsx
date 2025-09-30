import { useEffect, useMemo, useRef, useState } from "react";
import type { Product, SearchResult } from "../type/ProductSearch";
import type { TupleResult } from "../../../shared/type/Turple";
import ProductSearchResult from "./ProductSearchResult";

function normalize(text: string | undefined | null): string {
	return (text ?? "")
		.toString()
		.normalize("NFD")
		.replace(/\p{Diacritic}/gu, "")
		.toLowerCase()
		.trim();
}

async function fetchProductDataset(): Promise<TupleResult<Product[]>> {
	try {
		const response = await fetch("/data/products.json", {
			headers: { "cache-control": "no-cache" },
		});
		if (!response.ok) {
			return [new Error(`HTTP ${response.status}`), null];
		}
		const products = (await response.json()) as Product[];
		return [null, Array.isArray(products) ? products : []];
	} catch (error) {
		return [error as Error, null];
	}
}

function computeSearch(query: string, dataset: Product[]): SearchResult {
	const q = normalize(query);
	if (!q) return { exact: null, similars: [] };

	const valid = dataset.filter((p) => p && typeof p.name === "string");
	const exact = valid.find((p) => normalize(p.name) === q) ?? null;

	const similars = valid
		.filter((p) => normalize(p.name).includes(q))
		.filter((p) => (exact ? p.id !== exact.id : true))
		.slice(0, 25);

	return { exact, similars };
}

export default function ProductSearch() {
	const [query, setQuery] = useState("");
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
	const [disableBackdrop, setDisableBackdrop] = useState(false);
	const [splitView, setSplitView] = useState(false);

	const nameRef = useRef<HTMLInputElement | null>(null);
	const brandRef = useRef<HTMLInputElement | null>(null);
	const categoryRef = useRef<HTMLInputElement | null>(null);

	useEffect(() => {
		let mounted = true;
		(async () => {
			setLoading(true);
			const [err, data] = await fetchProductDataset();
			if (!mounted) return;
			if (err) {
				setError(err);
				setProducts([]);
			} else {
				setError(null);
				setProducts(data ?? []);
			}
			setLoading(false);
		})();
		return () => {
			mounted = false;
		};
	}, []);

	const result = useMemo(() => computeSearch(query, products), [query, products]);
	const hasExact = !!result.exact;
	const hasSimilars = result.similars.length > 0;
	const showCreate = !hasExact && !hasSimilars && query.trim().length > 0;

	function handleAddProduct(): TupleResult<Product> {
		const name = (nameRef.current?.value ?? "").trim();
		if (!name) return [new Error("Le nom du produit est requis."), null];

		const newProduct: Product = {
			id: `user_${Date.now()}`,
			name,
			brand: (brandRef.current?.value ?? "").trim() || undefined,
			category: (categoryRef.current?.value ?? "").trim() || undefined,
		};

		setProducts((prev) => [newProduct, ...prev]);
		return [null, newProduct];
	}

	return (
		<div className="grid gap-3">
			<div className="grid gap-1">
				<label htmlFor="product-search" className="font-medium">Rechercher un produit</label>
				<input
					id="product-search"
					type="text"
					placeholder="Rechercher un produit..."
					className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none ring-0 focus:border-slate-400"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					onFocus={() => window.dispatchEvent(new CustomEvent("product-search-focus"))}
					onBlur={() => window.dispatchEvent(new CustomEvent("product-search-blur"))}
				/>
				<p className="text-sm text-slate-500">Astuce: tapez le nom exact pour un match parfait, sinon on propose des similaires.</p>
				<label className="mt-1 inline-flex items-center gap-2 text-xs text-slate-600">
					<input
						type="checkbox"
						className="h-3.5 w-3.5 rounded border-slate-300"
						checked={disableBackdrop}
						onChange={(e) => setDisableBackdrop(e.target.checked)}
					/>
					Désactiver fond sombre
				</label>
			</div>

			{loading && (
				<div className="text-slate-600">Chargement...</div>
			)}
			{!loading && error && (
				<div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
					Impossible de charger les produits: {error.message}
				</div>
			)}

			{!loading && !error && (
				<div className="grid gap-2">
					{result.exact && (
						<div
							className="rounded-md border border-slate-200 p-2 cursor-pointer hover:bg-slate-50"
							onClick={() => { setSelectedProduct(result.exact!); setSplitView(true); }}
						>
							<strong>Exact:</strong> {result.exact.name}
							{result.exact.brand ? ` — ${result.exact.brand}` : ""}
						</div>
					)}

					{hasSimilars && (
						<div className="grid gap-1">
							<div className="font-semibold">Similaires</div>
							<div className="max-h-64 overflow-auto rounded-md border border-slate-200">
								{result.similars.map((p) => (
									<div
										key={p.id}
										className="border-b border-slate-100 p-2 last:border-b-0 cursor-pointer hover:bg-slate-50"
										onClick={() => { setSelectedProduct(p); setSplitView(true); }}
										role="button"
										tabIndex={0}
									>
										{p.name}
										{p.brand ? ` — ${p.brand}` : ""}
									</div>
								))}
							</div>
						</div>
					)}

					{showCreate && (
						<div className="grid gap-2 rounded-md border border-dashed border-slate-300 bg-slate-50 p-3">
							<div className="font-semibold">Produit introuvable ? Ajoutez-le</div>
							<input
								ref={nameRef}
								type="text"
								defaultValue={query}
								placeholder="Nom du produit"
								className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-400"
							/>
							<input
								ref={brandRef}
								type="text"
								placeholder="Marque (optionnel)"
								className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-400"
							/>
							<input
								ref={categoryRef}
								type="text"
								placeholder="Catégorie (optionnel)"
								className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-slate-400"
							/>
							<button
								onClick={() => {
									const [err, created] = handleAddProduct();
									if (!err && created) {
										setQuery(created.name);
										if (brandRef.current) brandRef.current.value = "";
										if (categoryRef.current) categoryRef.current.value = "";
									}
								}}
								className="inline-flex w-max items-center justify-center rounded-md bg-slate-900 px-3 py-2 text-white hover:bg-slate-800"
							>
								Ajouter
							</button>
						</div>
					)}
				</div>
			)}

			<ProductSearchResult
				product={selectedProduct}
				onClose={() => { setSelectedProduct(null); setSplitView(false); }}
				disableBackdrop={disableBackdrop || splitView}
				mode={splitView ? "split" : "modal"}
			/>
		</div>
	);
} 
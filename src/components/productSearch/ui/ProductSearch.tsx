import { useEffect, useMemo, useRef, useState } from "react";
import type { Product, SearchResult } from "../type/ProductSearch";
import type { TupleResult } from "../../../shared/type/Turple";
import ProductSearchResult from "./ProductSearchResult";
import { useSearchBar } from "../composable/useSearchBar";
import { pubSub } from "../../../shared/store/pubSub";

export default function ProductSearch() {

	const { state, results, loading, error } = useSearchBar();
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
	const [disableBackdrop, setDisableBackdrop] = useState(false);
	const [splitView, setSplitView] = useState(false);

	const nameRef = useRef<HTMLInputElement | null>(null);
	const brandRef = useRef<HTMLInputElement | null>(null);
	const categoryRef = useRef<HTMLInputElement | null>(null);

	const hasSimilars = results.products.length > 0;
	const showCreate = !hasSimilars && state.query && state.query.trim().length > 0;

	function handleAddProduct(): TupleResult<Product> {
		const name = (nameRef.current?.value ?? "").trim();
		if (!name) return [new Error("Le nom du produit est requis."), null];

		const newProduct: Product = {
			id: `user_${Date.now()}`,
			name,
			brand: (brandRef.current?.value ?? "").trim() || undefined,
			category: (categoryRef.current?.value ?? "").trim() || undefined,
		};

		pubSub.emit("search-bar:add-product", { query: name });

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
					value={state.query}
					onChange={(e) => pubSub.emit("search-bar:search", { query: e.target.value })}
					onFocus={() => window.dispatchEvent(new CustomEvent("product-search-focus"))}
					onBlur={() => window.dispatchEvent(new CustomEvent("product-search-blur"))}
				/>
				<p className="text-sm text-slate-500">Astuce: tapez le nom exact pour un match parfait, sinon on propose des similaires.</p>


				{state.characteristics?.map((c) => (
					<div key={c.toString()}>{c.label}: {c.value}</div>
				))}
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

					{hasSimilars && (
						<div className="grid gap-1">
							<div className="font-semibold">Similaires</div>
							<div className="max-h-64 overflow-auto rounded-md border border-slate-200">
								{results.products.map((p) => (
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
								defaultValue={state.query}
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
										pubSub.emit("search-bar:search", { query: created.name });
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
			/>
		</div>
	);
} 
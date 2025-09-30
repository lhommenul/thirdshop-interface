import { useEffect } from "react";
import type { Product } from "../type/ProductSearch";

interface ProductSearchResultProps {
	product: Product | null;
	onClose: () => void;
	disableBackdrop?: boolean;
	mode?: "modal" | "split";
}

export default function ProductSearchResult({ product, onClose, disableBackdrop = false, mode = "modal" }: ProductSearchResultProps) {
	useEffect(() => {
		function onKeyDown(e: KeyboardEvent) {
			if (e.key === "Escape") onClose();
		}
		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	}, [onClose]);

	if (!product) return null;

	const isSplit = mode === "split";
	const wrapperClass = disableBackdrop ? "fixed inset-0 z-50 pointer-events-none" : "fixed inset-0 z-50";

	return (
		<div className={wrapperClass}>
			{/* Overlay (only when backdrop enabled) */}
			{!disableBackdrop && (
				<button
					aria-label="Fermer"
					className="absolute inset-0 bg-slate-900/40"
					onClick={onClose}
				/>
			)}

			{/* Panel */}
			{isSplit ? (
				<div className="fixed right-6 top-6 bottom-6 w-full max-w-xl sm:w-[28rem] pointer-events-auto">
					<div className="relative h-full overflow-auto rounded-lg border border-slate-200 bg-white p-4 shadow-xl">
						{/* Accent like index cards */}
						<div className="absolute left-3 top-3" aria-hidden="true">
							<div className="h-1.5 w-14 rounded-full bg-gradient-to-r from-rose-200 to-blue-200"></div>
						</div>

						{/* Close button */}
						<button
							className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700"
							onClick={onClose}
							title="Fermer"
						>
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
								<path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 11-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
							</svg>
						</button>

						<div className="pt-6">
							<div className="text-base font-semibold text-slate-900">{product.name}</div>
							{product.brand && (
								<div className="mt-0.5 text-sm text-slate-600">Marque: {product.brand}</div>
							)}
							{product.category && (
								<div className="mt-0.5 text-sm text-slate-600">Catégorie: {product.category}</div>
							)}

							<div className="mt-3 grid gap-2">
								<div className="text-sm text-slate-700">
									ID: <span className="font-mono text-slate-900">{product.id}</span>
								</div>
								<div className="rounded-md border border-slate-100 bg-slate-50 p-2 text-xs text-slate-600">
									Plus de détails à venir: compatibilités, variantes, documents, etc.
								</div>
							</div>
						</div>
					</div>
				</div>
			) : (
				<div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-xl p-4 sm:inset-auto sm:bottom-auto sm:right-6 sm:top-6 sm:w-[28rem] sm:p-0">
					<div className="relative rounded-lg border border-slate-200 bg-white p-4 shadow-xl">
						{/* Accent like index cards */}
						<div className="absolute left-3 top-3" aria-hidden="true">
							<div className="h-1.5 w-14 rounded-full bg-gradient-to-r from-rose-200 to-blue-200"></div>
						</div>

						{/* Close button */}
						<button
							className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700"
							onClick={onClose}
							title="Fermer"
						>
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
								<path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 11-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
							</svg>
						</button>

						<div className="pt-6">
							<div className="text-base font-semibold text-slate-900">{product.name}</div>
							{product.brand && (
								<div className="mt-0.5 text-sm text-slate-600">Marque: {product.brand}</div>
							)}
							{product.category && (
								<div className="mt-0.5 text-sm text-slate-600">Catégorie: {product.category}</div>
							)}

							<div className="mt-3 grid gap-2">
								<div className="text-sm text-slate-700">
									ID: <span className="font-mono text-slate-900">{product.id}</span>
								</div>
								<div className="rounded-md border border-slate-100 bg-slate-50 p-2 text-xs text-slate-600">
									Plus de détails à venir: compatibilités, variantes, documents, etc.
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

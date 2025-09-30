import { useEffect, useRef, useState } from "react";
import type { Product } from "../type/ProductSearch";

import premiere from "../../../assets/images/premiere.png";
import second from "../../../assets/images/deuxieme.png";
import ProductDocuments, { type ProductDocumentNode } from "./ProductDocuments";

interface ProductSearchResultProps {
	product: Product | null;
	onClose: () => void;
	disableBackdrop?: boolean;
	mode?: "modal" | "split";
}

export default function ProductSearchResult({ product, onClose, disableBackdrop = false, mode = "modal" }: ProductSearchResultProps) {
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [panelWidth, setPanelWidth] = useState<number | null>(null);
	const draggingRef = useRef(false);
	const dragStartXRef = useRef(0);
	const startWidthRef = useRef(0);
	const dragDirectionRef = useRef<"left" | "right">("right");

	const images = [premiere, second];

	useEffect(() => {
		function onKeyDown(e: KeyboardEvent) {
			if (e.key === "Escape") onClose();
		}
		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	}, [onClose]);

	useEffect(() => {
		function onMouseMove(e: MouseEvent) {
			if (!draggingRef.current) return;
			const min = 320; // px
			const max = Math.min(960, window.innerWidth - 48); // px, keep some margin
			const delta = dragDirectionRef.current === "left"
				? (dragStartXRef.current - e.clientX)
				: (e.clientX - dragStartXRef.current);
			const next = Math.max(min, Math.min(max, startWidthRef.current + delta));
			setPanelWidth(next);
			e.preventDefault();
		}
		function onMouseUp() {
			draggingRef.current = false;
		}
		document.addEventListener("mousemove", onMouseMove);
		document.addEventListener("mouseup", onMouseUp);
		return () => {
			document.removeEventListener("mousemove", onMouseMove);
			document.removeEventListener("mouseup", onMouseUp);
		};
	}, []);

	if (!product) return null;

	const isSplit = mode === "split";
	const wrapperClass = disableBackdrop ? "fixed inset-0 z-50 pointer-events-none" : "fixed inset-0 z-50";
	const currentWidth = panelWidth ?? 448; // default 28rem

	function handleDragStartLeft(e: React.MouseEvent<HTMLDivElement>) {
		draggingRef.current = true;
		dragDirectionRef.current = "left";
		dragStartXRef.current = e.clientX;
		startWidthRef.current = currentWidth;
	}

	function handleDragStartRight(e: React.MouseEvent<HTMLDivElement>) {
		draggingRef.current = true;
		dragDirectionRef.current = "right";
		dragStartXRef.current = e.clientX;
		startWidthRef.current = currentWidth;
	}

	const docsSample: ProductDocumentNode[] = [
		{
			id: "d1",
			title: "Guide utilisateur",
			type: "pdf",
			url: "#",
			category: ["Guide utilisateur"],
		},
		{
			id: "d2",
			title: "Schémas",
			type: "folder",
			category: ["Vue éclatée", "Câblage"],
		},
		{ id: "d3", title: "Lien support", type: "link", url: "#", category: ["Vue éclatée", "Câblage", "Guide utilisateur"] },
	];

	return (
		<div className={wrapperClass}>
			{!disableBackdrop && !isFullscreen && (
				<button
					aria-label="Fermer"
					className="absolute inset-0 bg-slate-900/40"
					onClick={onClose}
				/>
			)}

			{isFullscreen ? (
				<div className="fixed inset-0 pointer-events-auto">
					<div className="relative h-full w-full overflow-auto bg-white p-4 shadow-xl">
						<div className="absolute left-3 top-3" aria-hidden="true">
							<div className="h-1.5 w-14 rounded-full bg-gradient-to-r from-rose-200 to-blue-200"></div>
						</div>

						<div className="absolute right-2 top-2 flex items-center gap-1">
							<button className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700" onClick={() => setIsFullscreen(false)} title="Quitter plein écran">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M9 3a1 1 0 0 1 1 1v2h2a1 1 0 1 1 0 2H9a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm6 0a1 1 0 0 0-1 1v3h3a1 1 0 1 0 0-2h-2V4a1 1 0 0 0-1-1ZM4 15a1 1 0 0 1 1 1v2h2a1 1 0 1 1 0 2H5a1 1 0 0 1-1-1v-3Zm16-1a1 1 0 0 0-1 1v3h-3a1 1 0 1 0 0 2h4a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1ZM20 3h-4a1 1 0 1 0 0 2h3v3a1 1 0 1 0 2 0V4a1 1 0 0 0-1-1ZM9 20a1 1 0 0 0-1-1H5v-3a1 1 0 1 0-2 0v4a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1Z" /></svg>
							</button>
							<button className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700" onClick={onClose} title="Fermer">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 11-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" /></svg>
							</button>
						</div>

						<div className="pt-6">
							<div className="text-base font-semibold text-slate-900">{product.name}</div>
							<div className="mt-3 grid gap-2">
								<ProductDocuments root={docsSample} initialExpandedIds={["d1", "d2"]} />
							</div>
						</div>
					</div>
				</div>
			) : (
				<>
					{isSplit ? (
						<div className="fixed right-6 top-6 bottom-6 pointer-events-auto" style={{ width: `${currentWidth}px` }}>
							<div className="relative h-full overflow-auto rounded-lg border border-slate-200 bg-white p-4 shadow-xl">
								<div className="absolute left-3 top-3" aria-hidden="true">
									<div className="h-1.5 w-14 rounded-full bg-gradient-to-r from-rose-200 to-blue-200"></div>
								</div>

								<div className="absolute right-2 top-2 flex items-center gap-1">
									<button className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700" onClick={() => setIsFullscreen(true)} title="Plein écran">
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M4 9a1 1 0 0 0 1-1V5h3a1 1 0 1 0 0-2H4a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1Zm16 6a1 1 0 0 0-1 1v3h-3a1 1 0 1 0 0 2h4a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1ZM20 3h-4a1 1 0 1 0 0 2h3v3a1 1 0 1 0 2 0V4a1 1 0 0 0-1-1ZM9 20a1 1 0 0 0-1-1H5v-3a1 1 0 1 0-2 0v4a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1Z" /></svg>
									</button>
									<button className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700" onClick={onClose} title="Fermer">
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 11-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" /></svg>
									</button>
								</div>

								<div className="absolute left-0 top-0 h-full w-2 cursor-col-resize bg-slate-200/80 hover:bg-slate-300 active:bg-slate-400 z-10" onMouseDown={handleDragStartLeft} title="Redimensionner" />

								<div className="pt-6">
									<div className="text-base font-semibold text-slate-900">{product.name}</div>

									<div className="grid grid-cols-2 gap-2 w-fit mb-2">
										{images.map((image, index) => (
											<div key={index} className="rounded overflow-hidden border border-slate-200 bg-white flex items-center justify-center rounded-lg w-40 h-40 shadow-md">
												<img src={image.src} alt={`Image ${index + 1}`} className="w-40 h-40 object-cover" />
											</div>
										))}
									</div>

									<div className="mt-3 grid gap-2">
										<ProductDocuments root={docsSample} initialExpandedIds={["d1", "d2"]} />
									</div>
								</div>
							</div>
						</div>
					) : (
						<div className="absolute inset-x-0 bottom-0 mx-auto w-full p-4 sm:inset-auto sm:bottom-auto sm:right-6 sm:top-6 sm:p-0 pointer-events-auto" style={{ maxWidth: `${Math.max(currentWidth, 320)}px` }}>
							<div className="relative rounded-lg border border-slate-200 bg-white p-4 shadow-xl">
								<div className="absolute left-3 top-3" aria-hidden="true">
									<div className="h-1.5 w-14 rounded-full bg-gradient-to-r from-rose-200 to-blue-200"></div>
								</div>

								<div className="absolute right-2 top-2 flex items-center gap-1">
									<button className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700" onClick={() => setIsFullscreen(true)} title="Plein écran">
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M4 9a1 1 0 0 0 1-1V5h3a1 1 0 1 0 0-2H4a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1Zm16 6a1 1 0 0 0-1 1v3h-3a1 1 0 1 0 0 2h4a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1ZM20 3h-4a1 1 0 1 0 0 2h3v3a1 1 0 1 0 2 0V4a1 1 0 0 0-1-1ZM9 20a1 1 0 0 0-1-1H5v-3a1 1 0 1 0-2 0v4a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1Z" /></svg>
									</button>
									<button className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700" onClick={onClose} title="Fermer">
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 11-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" /></svg>
									</button>
								</div>

								<div className="absolute right-0 top-0 h-full w-2 cursor-col-resize bg-slate-200/80 hover:bg-slate-300 active:bg-slate-400 z-10" onMouseDown={handleDragStartRight} title="Redimensionner" />

								<div className="pt-6">
									<div className="text-base font-semibold text-slate-900">{product.name}</div>

									<div className="grid grid-cols-2 gap-2 w-fit mb-2">
										{images.map((image, index) => (
											<div key={index} className="rounded overflow-hidden border border-slate-200 bg-white flex items-center justify-center rounded-lg w-40 h-40 shadow-md">
												<img src={image.src} alt={`Image ${index + 1}`} className="w-40 h-40 object-cover" />
											</div>
										))}
									</div>

									<div className="mt-3 grid gap-2">
										<ProductDocuments root={docsSample} initialExpandedIds={["d1", "d2"]} />
									</div>
								</div>
							</div>
						</div>
					)}
				</>
			)}
		</div>
	);
}

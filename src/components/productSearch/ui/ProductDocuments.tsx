import { useMemo, useState } from "react";

export interface ProductDocumentNode {
	id: string;
	title: string;
	type?: "pdf" | "image" | "link" | "note" | "folder";
	category?: string[];
	url?: string;
}

interface ProductDocumentsProps {
	root: ProductDocumentNode[];
	initialExpandedIds?: string[]; // kept for compatibility, unused in horizontal mode
	onOpen?: (node: ProductDocumentNode) => void;
	maxVisible?: number;
}

function Icon({ type = "folder" }: { type?: ProductDocumentNode["type"] }) {
	const common = "h-4 w-4";
	switch (type) {
		case "pdf":
			return (
				<svg className={common} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h8.5a2 2 0 0 0 1.414-.586l3.5-3.5A2 2 0 0 0 20 16.5V4a2 2 0 0 0-2-2H6Zm9 17.086V16h3.086L15 19.086Z"/></svg>
			);
		case "image":
			return (
				<svg className={common} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12.5a2.5 2.5 0 0 1-2.5 2.5H6a2 2 0 0 1-2-2V5Zm3 3a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm1 10 3.5-4.2a1 1 0 0 1 1.6 0L16 16l3-3 2 2v3H8Z"/></svg>
			);
		case "link":
			return (
				<svg className={common} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10.59 13.41a1.998 1.998 0 0 1 0-2.82l2-2a2 2 0 1 1 2.82 2.83l-2 2a2 2 0 0 1-2.82 0Zm-5 5a2 2 0 0 1 0-2.82l3-3a2 2 0 1 1 2.82 2.83l-3 3a2 2 0 0 1-2.82 0Zm8-8-3-3a2 2 0 1 1 2.82-2.83l3 3A2 2 0 0 1 13.59 10.41Z"/></svg>
			);
		case "note":
			return (
				<svg className={common} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6 3a2 2 0 0 0-2 2v14l4-3 4 3 4-3 4 3V5a2 2 0 0 0-2-2H6Z"/></svg>
			);
		default:
			return (
				<svg className={common} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4a2 2 0 0 0-2 2v12.5A1.5 1.5 0 0 0 3.5 20H20a2 2 0 0 0 2-2V8l-6-4h-6Z"/></svg>
			);
	}
}

export default function ProductDocuments({ root, onOpen, maxVisible = 20 }: ProductDocumentsProps) {
	const [showAll, setShowAll] = useState(false);
	const total = root.length;  
	const visibleDocs = useMemo(() => (showAll ? root : root.slice(0, maxVisible)), [root, showAll, maxVisible]);

	return (
		<div className="relative group">
			<div className="flex flex-wrap gap-2">
				{visibleDocs.map((doc) => (
					<button
						key={doc.id}
						onClick={() => { if (doc.url) window.open(doc.url, "_blank"); onOpen?.(doc); }}
						className="relative w-40 h-40 rounded-md border border-slate-200 bg-white p-2 text-left shadow-sm hover:shadow-md"
					>
						<div className="absolute left-2 top-2" aria-hidden="true">
							<div className="h-1 w-10 rounded-full bg-gradient-to-r from-rose-200 to-blue-200" />
						</div>
						<div className="flex items-center gap-2 pt-3">
							<Icon type={doc.type} />
							<div className="truncate text-sm font-medium text-slate-800" title={doc.title}>{doc.title}</div>
						</div>
						{doc.category && doc.category.length > 0 && (
							<div className="mt-2 flex flex-wrap gap-1">
								{doc.category.slice(0, 3).map((cat, idx) => (
									<span key={idx} className="inline-flex items-center rounded-full bg-sky-50 px-2 py-0.5 text-[10px] text-sky-700 ring-1 ring-sky-200">
										{cat}
									</span>
								))}
								{doc.category.length > 3 && (
									<span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-0.5 text-[10px] text-slate-700 ring-1 ring-slate-200">+{doc.category.length - 3}</span>
								)}
							</div>
						)}
					</button>
				))}
			</div>

			{total > maxVisible && !showAll && (
				<button
					onClick={() => setShowAll(true)}
					className="absolute right-0 -top-2 inline-flex items-center gap-1 rounded-md bg-white/80 px-2 py-1 text-xs text-slate-700 ring-1 ring-slate-200 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white"
					title={`Voir tout (${total})`}
				>
					<svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path d="M4 10a6 6 0 1112 0 6 6 0 01-12 0Zm6-3a1 1 0 00-1 1v3a1 1 0 001 1h2a1 1 0 100-2h-1V8a1 1 0 00-1-1z" /></svg>
					Voir tout ({total})
				</button>
			)}

			{total > maxVisible && showAll && (
				<div className="mt-2">
					<button
						onClick={() => setShowAll(false)}
						className="text-xs text-slate-600 underline underline-offset-4 hover:text-slate-800"
					>
						Réduire
					</button>
				</div>
			)}
		</div>
	);
} 
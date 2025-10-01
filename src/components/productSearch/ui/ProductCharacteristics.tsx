import { useMemo, useState } from "react";
import { pubSub } from "../../../shared/store/pubSub";

export interface Cara {
	label: string;
	value: string;
	// Keeping the provided name "cateory" for compatibility with the request
	cateory: string[];
}

interface ProductCharacteristicsProps {
	items: Cara[];
	title?: string;
	columns?: 1 | 2 | 3;
	groupByCategory?: boolean;
	showBadges?: boolean;
	onCopy?: (item: Cara) => void;
}

function CopyIcon({ copied = false }: { copied?: boolean }) {
	const common = "h-4 w-4";
	if (copied) {
		return (
			<svg className={common} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M16.707 5.293a1 1 0 0 1 0 1.414l-7.5 7.5a1 1 0 0 1-1.414 0l-4-4A1 1 0 1 1 5.207 8.793L8.5 12.086l6.793-6.793a1 1 0 0 1 1.414 0Z"/></svg>
		);
	}
	return (
		<svg className={common} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M16 1a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h10Zm2 6h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-2h8a4 4 0 0 0 4-4V7Z"/></svg>
	);
}

function Badge({ children }: { children: string }) {
	return (
		<span className="inline-flex items-center rounded-full bg-sky-50 px-2 py-0.5 text-[10px] text-sky-700 ring-1 ring-sky-200">
			{children}
		</span>
	);
}

function SectionTitle({ children }: { children: string }) {
	return (
		<div className="mb-2 mt-6 flex items-center gap-2">
			<div className="h-1 w-8 rounded-full bg-gradient-to-r from-rose-200 to-blue-200" aria-hidden="true" />
			<h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">{children}</h3>
		</div>
	);
}

function useNormalizedGroups(items: Cara[], enabled: boolean) {
	return useMemo(() => {
		if (!enabled) {
			return { groups: new Map<string, Cara[]>(), ungrouped: items };
		}

		const groups = new Map<string, Cara[]>();
		const ungrouped: Cara[] = [];

		for (const item of items) {
			const categories = Array.isArray(item.cateory) ? item.cateory : [];
			if (categories.length === 0) {
				ungrouped.push(item);
				continue;
			}
			for (const category of categories) {
				const list = groups.get(category) ?? [];
				list.push(item);
				groups.set(category, list);
			}
		}

		return { groups, ungrouped };
	}, [items, enabled]);
}

function SearchIcon() {

	return (
		<svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
	);
}

function handleSearch(item: Cara) {
	pubSub.emit("search-bar:search", { query: item.value, products: [] });
}

export default function ProductCharacteristics({
	items,
	title = "Caractéristiques du produit",
	columns = 2,
	groupByCategory = true,
	showBadges = true,
	onCopy,
}: ProductCharacteristicsProps) {
	const [copiedKey, setCopiedKey] = useState<string | null>(null);

	const { groups, ungrouped } = useNormalizedGroups(items, groupByCategory);

	const gridCols = useMemo(() => {
		switch (columns) {
			case 3:
				return "grid-cols-1 md:grid-cols-2 xl:grid-cols-3";
			case 2:
			default:
				return "grid-cols-1 sm:grid-cols-2";
		}
	}, [columns]);

	async function handleCopy(item: Cara) {
		try {
			await navigator.clipboard.writeText(item.value);
			setCopiedKey(item.label);
			setTimeout(() => setCopiedKey(null), 1200);
			onCopy?.(item);
		} catch {
			// no-op
		}
	}

	function renderItems(list: Cara[]) {
		return (
			<div className={`grid ${gridCols} gap-2`}> 
				{list.map((item) => (
					<div key={item.label} className="group/item relative rounded-md border border-slate-200 bg-white p-3 shadow-sm hover:shadow-md">
						<div className="flex items-start justify-between gap-3">
							<div className="min-w-0">
								<div className="truncate text-[11px] font-medium uppercase tracking-wide text-slate-500" title={item.label}>{item.label}</div>
								<div className="mt-0.5 truncate text-sm text-slate-800" title={item.value}>{item.value}</div>
								{showBadges && Array.isArray(item.cateory) && item.cateory.length > 0 && (
									<div className="mt-2 flex flex-wrap gap-1">
										{item.cateory.slice(0, 3).map((cat, idx) => (
											<Badge key={idx}>{cat}</Badge>
										))}
										{item.cateory.length > 3 && (
											<span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-0.5 text-[10px] text-slate-700 ring-1 ring-slate-200">+{item.cateory.length - 3}</span>
										)}
									</div>
								)}
							</div>
							<button
								type="button"
								onClick={() => handleCopy(item)}
								className="invisible ml-auto inline-flex items-center justify-center rounded-md border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-50 group-hover/item:visible"
								title="Copier la valeur"
								aria-label="Copier la valeur"
							>
								<CopyIcon copied={copiedKey === item.label} />
							</button>
							<button
								type="button"
								onClick={() => handleSearch(item)}
								className="invisible ml-auto inline-flex items-center justify-center rounded-md border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-50 group-hover/item:visible"
								title="Rechercher la valeur"
								aria-label="Rechercher la valeur"
							>
								<SearchIcon />
							</button>
						</div>
					</div>
				))}
			</div>
		);
	}

	return (
		<section className="relative">
			<header className="mb-3 flex items-center justify-between">
				<h2 className="text-base font-semibold text-slate-800">{title}</h2>
			</header>

			{/* Ungrouped */}
			{ungrouped.length > 0 && renderItems(ungrouped)}

			{/* Grouped sections */}
			{Array.from(groups.keys()).sort().map((category) => (
				<div key={category}>
					<SectionTitle>{category}</SectionTitle>
					{renderItems(groups.get(category) ?? [])}
				</div>
			))}
		</section>
	);
} 
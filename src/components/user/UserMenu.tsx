import { useEffect, useRef, useState } from "react";

type TupleResult<T> = [error: Error | null, data: T | null];

export default function UserMenu() {
	const [open, setOpen] = useState(false);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const menuRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		function onDocClick(e: MouseEvent) {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
				setOpen(false);
			}
		}
		document.addEventListener("click", onDocClick);
		return () => document.removeEventListener("click", onDocClick);
	}, []);

	async function handleLogin(): Promise<TupleResult<boolean>> {
		try {
			setIsAuthenticated(true);
			return [null, true];
		} catch (error) {
			return [error as Error, null];
		}
	}

	async function handleLogout(): Promise<TupleResult<boolean>> {
		try {
			setIsAuthenticated(false);
			return [null, true];
		} catch (error) {
			return [error as Error, null];
		}
	}

	return (
		<div ref={menuRef} className="relative">
			<button
				onClick={() => setOpen((v) => !v)}
				className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-slate-300 bg-white hover:bg-slate-50"
				title={isAuthenticated ? "Ouvrir le menu utilisateur" : "Se connecter"}
			>
				{isAuthenticated ? (
					<div className="flex h-full w-full items-center justify-center bg-slate-900 text-sm font-semibold text-white">
						U
					</div>
				) : (
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5 text-slate-700">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.118a7.5 7.5 0 0 1 15 0A17.933 17.933 0 0 1 12 21.75c-2.69 0-5.237-.584-7.5-1.632Z" />
					</svg>
				)}
			</button>

			{open && (
				<div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg">
					{isAuthenticated ? (
						<div className="grid">
							<button className="px-3 py-2 text-left hover:bg-slate-50">Mon compte</button>
							<button className="px-3 py-2 text-left hover:bg-slate-50">Paramètres</button>
							<button
								onClick={async () => {
									await handleLogout();
									setOpen(false);
								}}
								className="px-3 py-2 text-left hover:bg-slate-50"
							>
								Se déconnecter
							</button>
						</div>
					) : (
						<div className="grid">
							<button
								onClick={async () => {
									await handleLogin();
									setOpen(false);
								}}
								className="px-3 py-2 text-left hover:bg-slate-50"
							>
								Se connecter
							</button>
						</div>
					)}
				</div>
			)}
		</div>
	);
} 
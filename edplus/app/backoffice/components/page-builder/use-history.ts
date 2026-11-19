"use client";

import { useCallback, useState } from "react";

type State<T> = {
	past: T[];
	present: T;
	future: T[];
	lastKey?: string;
	lastAt: number;
};

const LIMIT = 100;
// Alterações seguidas ao mesmo campo (ex.: escrever um título) contam como um só passo.
const COALESCE_MS = 1000;

export function useHistory<T>(initial: T) {
	const [state, setState] = useState<State<T>>({ past: [], present: initial, future: [], lastAt: 0 });

	const set = useCallback((update: (current: T) => T, key?: string) => {
		setState((current) => {
			const next = update(current.present);
			if (next === current.present) return current;
			const now = Date.now();
			const coalesce = key !== undefined && key === current.lastKey && now - current.lastAt < COALESCE_MS;
			return {
				past: coalesce ? current.past : [...current.past, current.present].slice(-LIMIT),
				present: next,
				future: [],
				lastKey: key,
				lastAt: now,
			};
		});
	}, []);

	const undo = useCallback(() => {
		setState((current) => {
			if (!current.past.length) return current;
			return {
				past: current.past.slice(0, -1),
				present: current.past[current.past.length - 1],
				future: [current.present, ...current.future],
				lastAt: 0,
			};
		});
	}, []);

	const redo = useCallback(() => {
		setState((current) => {
			if (!current.future.length) return current;
			return {
				past: [...current.past, current.present],
				present: current.future[0],
				future: current.future.slice(1),
				lastAt: 0,
			};
		});
	}, []);

	return {
		value: state.present,
		set,
		undo,
		redo,
		canUndo: state.past.length > 0,
		canRedo: state.future.length > 0,
	};
}

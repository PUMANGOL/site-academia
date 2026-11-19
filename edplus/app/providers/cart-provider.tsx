"use client";

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from "react";
import {
	addToCart,
	getCart,
	removeCartItem,
	updateCartItemQuantity,
	type CartView,
} from "@/app/actions/cart";

type CartContextValue = {
	cart: CartView;
	loading: boolean;
	refresh: () => Promise<void>;
	addCourse: (courseId: string) => Promise<{ ok: boolean; error?: string }>;
	setQuantity: (itemId: string, quantity: number) => Promise<void>;
	removeItem: (itemId: string) => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

const emptyCart: CartView = {
	id: null,
	items: [],
	subtotal: 0,
	itemCount: 0,
};

export function CartProvider({ children }: { children: ReactNode }) {
	const [cart, setCart] = useState<CartView>(emptyCart);
	const [loading, setLoading] = useState(true);

	const refresh = useCallback(async () => {
		const next = await getCart();
		setCart(next);
	}, []);

	useEffect(() => {
		refresh().finally(() => setLoading(false));
	}, [refresh]);

	const addCourse = useCallback(async (courseId: string) => {
		const result = await addToCart(courseId);
		if (result.ok) {
			setCart(result.cart);
			return { ok: true };
		}
		return { ok: false, error: result.error };
	}, []);

	const setQuantity = useCallback(async (itemId: string, quantity: number) => {
		const result = await updateCartItemQuantity(itemId, quantity);
		if (result.ok) setCart(result.cart);
	}, []);

	const removeItem = useCallback(async (itemId: string) => {
		const result = await removeCartItem(itemId);
		if (result.ok) setCart(result.cart);
	}, []);

	const value = useMemo(
		() => ({
			cart,
			loading,
			refresh,
			addCourse,
			setQuantity,
			removeItem,
		}),
		[cart, loading, refresh, addCourse, setQuantity, removeItem]
	);

	return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
	const context = useContext(CartContext);
	if (!context) {
		throw new Error("useCart must be used within CartProvider");
	}
	return context;
}

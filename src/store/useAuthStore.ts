import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
	id: string;
	name: string;
	email: string;
	avatar?: string;
	role: string;
	permissions: string[];
}

interface AuthState {
	token: string | null;
	user: User | null;
	isLoading: boolean;
	isAuthenticated: boolean;
	setAuth: (token: string, user: User) => void;
	logout: () => void;
	setUser: (user: User) => void;
	setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			token: null,
			user: null,
			isLoading: false,
			isAuthenticated: false,

			setAuth: (token: string, user: User) => {
				set({
					token,
					user,
					isAuthenticated: true,
					isLoading: false,
				});
			},

			logout: () => {
				set({
					token: null,
					user: null,
					isAuthenticated: false,
				});
			},

			setUser: (user: User) => set({ user }),

			setLoading: (isLoading: boolean) => set({ isLoading }),
		}),
		{
			name: "auth-storage",
			partialize: (state) => ({
				token: state.token,
				user: state.user,
				isAuthenticated: state.isAuthenticated,
			}),
			onRehydrateStorage: () => (state) => {
				if (state?.token) {
					state.isAuthenticated = true;
				}
			},
		}
	)
);

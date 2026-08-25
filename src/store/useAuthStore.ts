import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface User {
	id: string;
	name: string;
	email: string;
	avatar?: string;
	role: string;
	roleId?: number;
	roleName?: string;
	principalBranchId?: number | null;
	permissions: string[];
	temporaryPassword?: boolean;
}

/** Fields safe to persist — no PII (FE-B-2). Full profile comes from /auth/me. */
type PersistedUser = Pick<
	User,
	| "id"
	| "role"
	| "roleId"
	| "roleName"
	| "principalBranchId"
	| "permissions"
	| "temporaryPassword"
>;

interface AuthState {
	/** Session marker only — access JWT lives in httpOnly cookie (not readable by JS). */
	token: string | null;
	user: User | null;
	isLoading: boolean;
	isAuthenticated: boolean;
	setAuth: (token: string | null, user: User) => void;
	setToken: (token: string | null) => void;
	logout: () => void;
	setUser: (user: User) => void;
	setLoading: (loading: boolean) => void;
}

function toPersistedUser(user: User): PersistedUser {
	return {
		id: user.id,
		role: user.role,
		roleId: user.roleId,
		roleName: user.roleName,
		principalBranchId: user.principalBranchId,
		permissions: user.permissions,
		temporaryPassword: user.temporaryPassword,
	};
}

function fromPersistedUser(user: PersistedUser): User {
	return {
		...user,
		name: "",
		email: "",
	};
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			token: null,
			user: null,
			isLoading: false,
			isAuthenticated: false,

			setAuth: (_token: string | null, user: User) => {
				set({
					// Do not persist the JWT; cookie carries the session.
					token: "cookie",
					user,
					isAuthenticated: true,
					isLoading: false,
				});
			},

			setToken: (_token: string | null) => {
				set({ token: "cookie", isAuthenticated: true });
			},

			logout: () => {
				set({
					token: null,
					user: null,
					isAuthenticated: false,
				});
			},

			setUser: (user: User) => set({ user, isAuthenticated: true }),

			setLoading: (isLoading: boolean) => set({ isLoading }),
		}),
		{
			name: "auth-storage",
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				isAuthenticated: state.isAuthenticated,
				user: state.user ? toPersistedUser(state.user) : null,
			}),
			onRehydrateStorage: () => (state) => {
				if (!state) return;
				if (state.isAuthenticated && state.user) {
					state.token = "cookie";
					state.user = fromPersistedUser(state.user as PersistedUser);
				}
			},
		}
	)
);

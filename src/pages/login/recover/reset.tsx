import { useEffect } from "react";
import { useRouter } from "next/router";

export default function RecoverPasswordResetRedirectPage() {
	const router = useRouter();

	useEffect(() => {
		void router.replace("/login/recover");
	}, [router]);

	return null;
}

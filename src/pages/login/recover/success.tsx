import { useEffect } from "react";
import { useRouter } from "next/router";

export default function RecoverPasswordSuccessRedirectPage() {
	const router = useRouter();

	useEffect(() => {
		void router.replace("/login");
	}, [router]);

	return null;
}

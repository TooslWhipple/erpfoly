import Image from "next/image";
import { useRouter } from "next/router";
import { Button, useMediaQuery, useTheme } from "@mui/material";
import { CheckCircle } from "lucide-react";
import {
	PageContainer,
	LeftPanel,
	RightPanel,
	LogoContainer,
	FormWrapper,
	LoginTitle,
	LoginDescription,
} from "@/styles/login/styles";

export default function RecoverPasswordSentPage() {
	const router = useRouter();
	const theme = useTheme();
	const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

	return (
		<PageContainer>
			<LeftPanel />
			<RightPanel>
				<LogoContainer>
					<Image src="/logo/foly-login.svg" alt="foly" width={44} height={24} priority />
				</LogoContainer>

				<FormWrapper>
					<CheckCircle
						size={isSmallScreen ? 56 : 72}
						color={theme.palette.primary.main}
						strokeWidth={1.5}
					/>

					<LoginTitle>Revisa tu WhatsApp</LoginTitle>

					<LoginDescription variant="body2">
						Hemos enviado un enlace de recuperación de contraseña a tu WhatsApp.
					</LoginDescription>

					<Button
						fullWidth
						variant="contained"
						color="primary"
						onClick={() => router.push("/login")}
					>
						Volver al inicio de sesión
					</Button>
				</FormWrapper>
			</RightPanel>
		</PageContainer>
	);
}

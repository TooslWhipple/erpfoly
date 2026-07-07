import Image from "next/image";
import { useRouter } from "next/router";
import { Button, Typography, useMediaQuery, useTheme } from "@mui/material";
import { CheckCircle } from "lucide-react";
import {
	PageContainer,
	LeftPanel,
	RightPanel,
	LogoContainer,
	FormWrapper,
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

					<Typography variant="h1" textAlign="center">Revisa tu WhatsApp</Typography>

					<Typography variant="body2" color="text.secondary" textAlign="center">
						Te enviamos una contraseña temporal por WhatsApp. Válida por 1 hora. Inicia sesión con ella y crea una nueva contraseña.
					</Typography>

					<Button
						fullWidth
						variant="contained"
						color="primary"
						onClick={() => router.push("/login")}>
						Volver al inicio de sesión
					</Button>
				</FormWrapper>
			</RightPanel>
		</PageContainer>
	);
}

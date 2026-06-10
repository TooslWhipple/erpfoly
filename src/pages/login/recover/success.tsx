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

export default function RecoverPasswordSuccessPage() {
	const router = useRouter();
	const theme = useTheme();
	const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

	return (
		<PageContainer>
			<LeftPanel />
			<RightPanel>
				<LogoContainer>
					<Image
						src="/logo/foly-login.svg"
						alt="foly"
						width={44}
						height={24}
						priority
					/>
				</LogoContainer>

				<FormWrapper>
					<CheckCircle
						size={isSmallScreen ? 56 : 72}
						color={theme.palette.primary.main}
						strokeWidth={1.5}
					/>

					<LoginTitle>Nueva contraseña establecida</LoginTitle>

					<LoginDescription variant="body2">
						Hemos guardado tu nueva contraseña. Ve a Inicio de sesión para ingresar con tus
						nuevas credenciales.
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

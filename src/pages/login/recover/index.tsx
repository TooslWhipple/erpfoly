import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import {
	Button,
	CircularProgress,
	InputAdornment,
	Typography,
	useTheme,
} from "@mui/material";
import { ArrowLeft, Phone } from "lucide-react";
import { usePasswordRecovery } from "@/hooks/usePasswordRecovery";
import {
	CELLPHONE_LENGTH,
	getCellphoneValidationError,
	isValidCellphone,
	sanitizeCellphoneInput,
} from "@/utils/auth-credentials";
import {
	PageContainer,
	LeftPanel,
	RightPanel,
	LogoContainer,
	FormWrapper,
	Form,
	StyledTextField,
	BackLink,
} from "@/styles/login/styles";

export default function RecoverPasswordPage() {
	const router = useRouter();
	const theme = useTheme();
	const { requestRecovery, isLoading, error, clearError } = usePasswordRecovery();
	const [cellphone, setCellphone] = useState("");

	const trimmedCellphone = cellphone.trim();
	const cellphoneValidationError = getCellphoneValidationError(trimmedCellphone) ?? "";
	const cellphoneFieldError = cellphoneValidationError || error || "";
	const canSubmit = isValidCellphone(trimmedCellphone) && !isLoading;

	const handleBackToLogin = (event: React.MouseEvent<HTMLAnchorElement>) => {
		event.preventDefault();
		router.push("/login");
	};

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		if (!canSubmit) return;
		await requestRecovery(trimmedCellphone);
	};

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
					<Typography variant="h1" textAlign="center">Recupera tu contraseña</Typography>

					<BackLink href="/login" onClick={handleBackToLogin}>
						<ArrowLeft size={16} color={theme.palette.text.secondary} />
						Volver al inicio de sesión
					</BackLink>

					<Typography variant="body2" color="text.secondary" textAlign="center">Ingresa tu número de celular. Te enviaremos un enlace por WhatsApp para que crees una nueva contraseña.</Typography>

					<Form onSubmit={handleSubmit}>
						<StyledTextField
							label="Número de celular *"
							placeholder="Ingresa tu número de celular"
							type="tel"
							value={cellphone}
							onChange={(event) => {
								clearError();
								setCellphone(sanitizeCellphoneInput(event.target.value));
							}}
							error={!!cellphoneFieldError}
							helperText={cellphoneFieldError}
							fullWidth
							autoFocus
							disabled={isLoading}
							inputProps={{
								maxLength: CELLPHONE_LENGTH,
								inputMode: "numeric",
							}}
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<Phone size={20} color={theme.palette.text.secondary} />
									</InputAdornment>
								),
							}}
						/>

						<Button
							fullWidth
							type="submit"
							variant="contained"
							color="primary"
							disabled={!canSubmit}
						>
							{isLoading ? <CircularProgress size={24} color="inherit" /> : "Recuperar contraseña"}
						</Button>
					</Form>
				</FormWrapper>
			</RightPanel>
		</PageContainer>
	);
}

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import {
	Button,
	CircularProgress,
	InputAdornment,
	useTheme,
} from "@mui/material";
import { ArrowLeft, IdCard } from "lucide-react";
import { usePasswordRecovery } from "@/hooks/usePasswordRecovery";
import {
	getIdentifierValidationError,
	isValidIdentifier,
	sanitizeIdentifierInput,
	USERNAME_MAX_LENGTH,
} from "@/utils/auth-credentials";
import {
	PageContainer,
	LeftPanel,
	RightPanel,
	LogoContainer,
	FormWrapper,
	Form,
	LoginTitle,
	LoginDescription,
	StyledTextField,
	BackLink,
} from "@/styles/login/styles";

export default function RecoverPasswordPage() {
	const router = useRouter();
	const theme = useTheme();
	const { requestRecovery, isLoading, error, clearError } = usePasswordRecovery();
	const [identifier, setIdentifier] = useState("");

	const trimmedIdentifier = identifier.trim();
	const identifierValidationError = getIdentifierValidationError(trimmedIdentifier) ?? "";
	const identifierFieldError = identifierValidationError || error || "";
	const canSubmit = isValidIdentifier(trimmedIdentifier) && !isLoading;

	const handleBackToLogin = (event: React.MouseEvent<HTMLAnchorElement>) => {
		event.preventDefault();
		router.push("/login");
	};

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		if (!canSubmit) return;
		await requestRecovery(trimmedIdentifier);
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
					<LoginTitle>Recupera tu contraseña</LoginTitle>

					<BackLink href="/login" onClick={handleBackToLogin}>
						<ArrowLeft size={16} color={theme.palette.text.secondary} />
						Volver al inicio de sesión
					</BackLink>

					<LoginDescription variant="body2">
						Ingresa tu número de empleado o celular. Te enviaremos un enlace por WhatsApp para que
						crees una nueva contraseña.
					</LoginDescription>

					<Form onSubmit={handleSubmit}>
						<StyledTextField
							label="Número de empleado o celular *"
							placeholder="Ingresa tu número de empleado o celular"
							type="text"
							value={identifier}
							onChange={(event) => {
								clearError();
								setIdentifier(sanitizeIdentifierInput(event.target.value));
							}}
							error={!!identifierFieldError}
							helperText={identifierFieldError}
							fullWidth
							autoFocus
							disabled={isLoading}
							inputProps={{ maxLength: USERNAME_MAX_LENGTH }}
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<IdCard size={20} color={theme.palette.text.secondary} />
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

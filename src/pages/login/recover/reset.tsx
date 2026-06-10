import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import {
	Button,
	CircularProgress,
	InputAdornment,
	Typography,
	useTheme,
} from "@mui/material";
import { Lock } from "lucide-react";
import { PasswordFieldAdornment } from "@/components/PasswordFieldAdornment";
import { authService } from "@/services/auth.service";
import { usePasswordRecovery } from "@/hooks/usePasswordRecovery";
import {
	getPasswordValidationError,
	isValidPassword,
	sanitizePasswordInput,
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
	RecoveryLink,
} from "@/styles/login/styles";

export default function ResetPasswordPage() {
	const router = useRouter();
	const theme = useTheme();
	const { resetPassword, isLoading, error, clearError } = usePasswordRecovery();

	const [token, setToken] = useState("");
	const [isValidatingToken, setIsValidatingToken] = useState(true);
	const [tokenError, setTokenError] = useState<string | null>(null);
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const passwordError = getPasswordValidationError(newPassword) ?? "";
	const confirmPasswordError =
		confirmPassword && confirmPassword !== newPassword
			? "Las contraseñas no coinciden"
			: "";

	const canSubmit =
		!!token &&
		!tokenError &&
		isValidPassword(newPassword) &&
		confirmPassword === newPassword &&
		!isLoading &&
		!isValidatingToken;

	useEffect(() => {
		const queryToken = router.query.token;
		if (!router.isReady) return;

		if (typeof queryToken !== "string" || !queryToken.trim()) {
			setTokenError("El enlace de recuperación no es válido");
			setIsValidatingToken(false);
			return;
		}

		const recoveryToken = queryToken.trim();
		setToken(recoveryToken);

		let cancelled = false;

		const validateToken = async () => {
			const result = await authService.validateRecoveryToken(recoveryToken);
			if (cancelled) return;

			if (result.error) {
				setTokenError(
					result.error.message || "El enlace de recuperación no es válido o expiró"
				);
			}

			setIsValidatingToken(false);
		};

		void validateToken();

		return () => {
			cancelled = true;
		};
	}, [router.isReady, router.query.token]);

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		if (!canSubmit) return;

		await resetPassword({
			token,
			newPassword,
			confirmPassword,
		});
	};

	const feedbackMessage = tokenError || error;

	const confirmFieldError = confirmPasswordError || feedbackMessage || "";

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
					<LoginTitle>Crea una nueva contraseña</LoginTitle>

					<LoginDescription variant="body2">
						Ingresa y confirma tu nueva contraseña para recuperar el acceso a tu cuenta.
					</LoginDescription>

					{isValidatingToken ? (
						<CircularProgress />
					) : (
						<Form onSubmit={handleSubmit}>
							<StyledTextField
								label="Nueva contraseña *"
								placeholder="Ingresa tu nueva contraseña"
								type={showNewPassword ? "text" : "password"}
								value={newPassword}
								onChange={(event) => {
									clearError();
									setNewPassword(sanitizePasswordInput(event.target.value));
								}}
								error={!!passwordError}
								helperText={passwordError}
								fullWidth
								autoFocus
								disabled={!!tokenError}
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<Lock size={20} color={theme.palette.text.secondary} />
										</InputAdornment>
									),
									endAdornment: (
										<PasswordFieldAdornment
											length={newPassword.length}
											showPassword={showNewPassword}
											onToggleVisibility={() => setShowNewPassword((value) => !value)}
											iconColor={theme.palette.text.secondary}
										/>
									),
								}}
							/>

							<StyledTextField
								label="Confirma tu nueva contraseña *"
								placeholder="Confirma tu nueva contraseña"
								type={showConfirmPassword ? "text" : "password"}
								value={confirmPassword}
								onChange={(event) => {
									clearError();
									setConfirmPassword(sanitizePasswordInput(event.target.value));
								}}
								error={!!confirmFieldError}
								helperText={confirmFieldError}
								fullWidth
								disabled={!!tokenError}
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<Lock size={20} color={theme.palette.text.secondary} />
										</InputAdornment>
									),
									endAdornment: (
										<PasswordFieldAdornment
											length={confirmPassword.length}
											showPassword={showConfirmPassword}
											onToggleVisibility={() => setShowConfirmPassword((value) => !value)}
											iconColor={theme.palette.text.secondary}
										/>
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
								{isLoading ? <CircularProgress size={24} color="inherit" /> : "Crear nueva contraseña"}
							</Button>

							{tokenError && (
								<Typography variant="body2" color="text.secondary" textAlign="center">
									<RecoveryLink
										href="/login/recover"
										onClick={(event: React.MouseEvent) => {
											event.preventDefault();
											router.push("/login/recover");
										}}
									>
										Solicitar un nuevo enlace
									</RecoveryLink>
								</Typography>
							)}
						</Form>
					)}
				</FormWrapper>
			</RightPanel>
		</PageContainer>
	);
}

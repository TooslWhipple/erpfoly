import { useState } from "react";
import Image from "next/image";
import { CircularProgress, InputAdornment, IconButton, Typography, Button, useTheme } from "@mui/material";
import { useRouter } from "next/router";
import { Eye, EyeOff, IdCard, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { parseLoginIdentifier } from "@/utils/login-identifier";
import {
	getIdentifierValidationError,
	getPasswordValidationError,
	isValidIdentifier,
	isValidPassword,
	sanitizeIdentifierInput,
	sanitizePasswordInput,
	USERNAME_MAX_LENGTH,
} from "@/utils/auth-credentials";
import {
	PageContainer,
	LeftPanel,
	RightPanel,
	FormWrapper,
	LogoContainer,
	Form,
	LoginTitle,
	StyledTextField,
	RecoveryRow,
	RecoveryLink,
} from "@/styles/login/styles";

export default function LoginPage() {
	const router = useRouter();
	const theme = useTheme();
	const { login, isLoading, error, clearError } = useAuth();
	const [showPassword, setShowPassword] = useState(false);

	const [identifier, setIdentifier] = useState("");
	const [password, setPassword] = useState("");

	const trimmedId = identifier.trim();
	const identifierValidationError = getIdentifierValidationError(trimmedId) ?? "";
	const passwordValidationError = getPasswordValidationError(password) ?? "";
	const passwordFieldError = passwordValidationError || error || "";
	const hasLoginError = !!error;

	const canSubmitLogin =
		isValidIdentifier(trimmedId) && isValidPassword(password);

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!canSubmitLogin) return;
		const parsed = parseLoginIdentifier(trimmedId);
		await login(
			parsed.cellphone
				? { cellphone: parsed.cellphone, password }
				: { username: parsed.username ?? trimmedId, password }
		);
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
					<LoginTitle>Ingresa a tu cuenta</LoginTitle>

					<Form onSubmit={handleLogin}>
						<StyledTextField
							label="Número de empleado *"
							placeholder="Ingresa tu número de empleado"
							type="text"
							value={identifier}
							onChange={(e) => {
								clearError();
								setIdentifier(sanitizeIdentifierInput(e.target.value));
							}}
							error={!!identifierValidationError || hasLoginError}
							helperText={identifierValidationError}
							fullWidth
							autoComplete="username"
							autoFocus
							inputProps={{ maxLength: USERNAME_MAX_LENGTH }}
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<IdCard size={20} color={theme.palette.text.secondary} />
									</InputAdornment>
								),
							}}
						/>

						<StyledTextField
							label="Ingresa tu contraseña *"
							placeholder="Ingresa tu contraseña"
							type={showPassword ? "text" : "password"}
							value={password}
							onChange={(e) => {
								clearError();
								setPassword(sanitizePasswordInput(e.target.value));
							}}
							error={!!passwordFieldError}
							helperText={passwordFieldError}
							fullWidth
							autoComplete="current-password"
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<Lock size={20} color={theme.palette.text.secondary} />
									</InputAdornment>
								),
								endAdornment: (
									<InputAdornment position="end">
										<IconButton
											onClick={() => setShowPassword(!showPassword)}
											edge="end"
											size="small"
											aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
										>
											{showPassword ? (
												<EyeOff size={20} color={theme.palette.text.secondary} />
											) : (
												<Eye size={20} color={theme.palette.text.secondary} />
											)}
										</IconButton>
									</InputAdornment>
								),
							}}
						/>

						<Button
							fullWidth
							type="submit"
							variant="contained"
							color="primary"
							disabled={isLoading}>
							{isLoading ? <CircularProgress size={24} color="inherit" /> : "Ingresar"}
						</Button>
					</Form>

					<RecoveryRow>
						<Typography variant="body2" color="text.secondary">¿Olvidaste tu contraseña?</Typography>
						<RecoveryLink
							href="/login/recover"
							onClick={(e: React.MouseEvent) => {
								e.preventDefault();
								router.push("/login/recover");
							}}
						>
							Recuperar
						</RecoveryLink>
					</RecoveryRow>
				</FormWrapper>
			</RightPanel>
		</PageContainer >
	);
}


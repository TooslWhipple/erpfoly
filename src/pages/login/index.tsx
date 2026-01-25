import { useState } from "react";
import { Alert, CircularProgress, InputAdornment, IconButton } from "@mui/material";
import {
	Visibility,
	VisibilityOff,
	ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/auth.service";
import {
	PageContainer,
	LoginCard,
	LogoContainer,
	LogoBox,
	LogoText,
	BrandName,
	Title,
	Subtitle,
	Form,
	StyledTextField,
	SubmitButton,
	ForgotLink,
	BackLink,
	AlertContainer,
} from "@/styles/login/styles";

type View = "login" | "forgot";

export default function LoginPage() {
	const { login, isLoading } = useAuth();
	const [view, setView] = useState<View>("login");
	const [showPassword, setShowPassword] = useState(false);

	// Login form
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loginError, setLoginError] = useState<string | null>(null);

	// Forgot password form
	const [forgotEmail, setForgotEmail] = useState("");
	const [forgotLoading, setForgotLoading] = useState(false);
	const [forgotError, setForgotError] = useState<string | null>(null);
	const [forgotSuccess, setForgotSuccess] = useState(false);

	// Validations
	const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
	const isValidPassword = (value: string) => value.length >= 8;

	const emailError = email && !isValidEmail(email) ? "Ingresa un email válido" : "";
	const passwordError = password && !isValidPassword(password) ? "La contraseña debe tener al menos 8 caracteres" : "";
	const forgotEmailError = forgotEmail && !isValidEmail(forgotEmail) ? "Ingresa un email válido" : "";

	const canSubmitLogin = email && password && isValidEmail(email) && isValidPassword(password);
	const canSubmitForgot = forgotEmail && isValidEmail(forgotEmail);

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!canSubmitLogin) return;

		setLoginError(null);
		try {
			await login({ email, password });
		} catch {
			setLoginError("Credenciales incorrectas");
		}
	};

	const handleForgotPassword = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!canSubmitForgot) return;

		setForgotError(null);
		setForgotLoading(true);

		try {
			await authService.forgotPassword({ email: forgotEmail });
			setForgotSuccess(true);
		} catch {
			setForgotError("No se pudo enviar el correo. Intenta de nuevo.");
		} finally {
			setForgotLoading(false);
		}
	};

	const handleBackToLogin = () => {
		setView("login");
		setForgotEmail("");
		setForgotError(null);
		setForgotSuccess(false);
	};

	return (
		<PageContainer>
			<LoginCard elevation={0}>
				<LogoContainer>
					<LogoBox>
						<LogoText>Foly</LogoText>
					</LogoBox>
					<BrandName>Folysoft</BrandName>
				</LogoContainer>

				{view === "login" ? (
					<>
						<Title variant="h5">Iniciar sesión</Title>
						<Subtitle variant="body2" color="text.secondary">
							Ingresa tus credenciales para continuar
						</Subtitle>

						{loginError && (
							<AlertContainer>
								<Alert severity="error" onClose={() => setLoginError(null)}>
									{loginError}
								</Alert>
							</AlertContainer>
						)}

						<Form onSubmit={handleLogin}>
							<StyledTextField
								label="Email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								error={!!emailError}
								helperText={emailError}
								fullWidth
								autoComplete="email"
								autoFocus
							/>

							<StyledTextField
								label="Contraseña"
								type={showPassword ? "text" : "password"}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								error={!!passwordError}
								helperText={passwordError}
								fullWidth
								autoComplete="current-password"
								InputProps={{
									endAdornment: (
										<InputAdornment position="end">
											<IconButton
												onClick={() => setShowPassword(!showPassword)}
												edge="end"
												size="small"
											>
												{showPassword ? <VisibilityOff /> : <Visibility />}
											</IconButton>
										</InputAdornment>
									),
								}}
							/>

							<ForgotLink onClick={() => setView("forgot")}>
								¿Olvidaste tu contraseña?
							</ForgotLink>

							<SubmitButton
								type="submit"
								variant="contained"
								fullWidth
								disabled={!canSubmitLogin || isLoading}
							>
								{isLoading ? <CircularProgress size={24} color="inherit" /> : "Iniciar sesión"}
							</SubmitButton>
						</Form>
					</>
				) : (
					<>
						<BackLink onClick={handleBackToLogin}>
							<ArrowBackIcon fontSize="small" />
							Volver al inicio de sesión
						</BackLink>

						<Title variant="h5">Recuperar contraseña</Title>
						<Subtitle variant="body2" color="text.secondary">
							Ingresa tu email y te enviaremos instrucciones
						</Subtitle>

						{forgotError && (
							<AlertContainer>
								<Alert severity="error" onClose={() => setForgotError(null)}>
									{forgotError}
								</Alert>
							</AlertContainer>
						)}

						{forgotSuccess ? (
							<Alert severity="success">
								Se ha enviado un correo con las instrucciones para recuperar tu contraseña.
							</Alert>
						) : (
							<Form onSubmit={handleForgotPassword}>
								<StyledTextField
									label="Email"
									type="email"
									value={forgotEmail}
									onChange={(e) => setForgotEmail(e.target.value)}
									error={!!forgotEmailError}
									helperText={forgotEmailError}
									fullWidth
									autoComplete="email"
									autoFocus
								/>

								<SubmitButton
									type="submit"
									variant="contained"
									fullWidth
									disabled={!canSubmitForgot || forgotLoading}
								>
									{forgotLoading ? (
										<CircularProgress size={24} color="inherit" />
									) : (
										"Enviar instrucciones"
									)}
								</SubmitButton>
							</Form>
						)}
					</>
				)}
			</LoginCard>
		</PageContainer>
	);
}


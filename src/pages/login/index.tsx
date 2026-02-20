import { useState } from "react";
import { Alert, CircularProgress, InputAdornment, IconButton, Typography } from "@mui/material";
import {
	Visibility,
	VisibilityOff,
	ArrowBack as ArrowBackIcon,
	Badge as BadgeIcon,
	Lock as LockIcon,
} from "@mui/icons-material";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/auth.service";
import {
	PageContainer,
	LoginCard,
	LogoContainer,
	BrandName,
	WelcomeText,
	Form,
	StyledTextField,
	SubmitButton,
	ForgotButton,
	BackLink,
	AlertContainer,
} from "@/styles/login/styles";

type View = "login" | "forgot";

export default function LoginPage() {
	const { login, isLoading, error: loginError, clearError: clearLoginError } = useAuth();
	const [view, setView] = useState<View>("login");
	const [showPassword, setShowPassword] = useState(false);

	// Login form
	const [employeeNumber, setEmployeeNumber] = useState("");
	const [password, setPassword] = useState("");

	// Forgot password form
	const [forgotEmail, setForgotEmail] = useState("");
	const [forgotLoading, setForgotLoading] = useState(false);
	const [forgotError, setForgotError] = useState<string | null>(null);
	const [forgotSuccess, setForgotSuccess] = useState(false);

	// Validations
	const isValidEmployeeNumber = (value: string) => /^\d+$/.test(value.trim()) && parseInt(value.trim(), 10) >= 1;
	const isValidPassword = (value: string) => value.length >= 8;

	const employeeNumberError = employeeNumber && !isValidEmployeeNumber(employeeNumber)
		? "Ingresa un número de empleado válido"
		: "";
	const passwordError = password && !isValidPassword(password) ? "La contraseña debe tener al menos 8 caracteres" : "";
	const forgotEmailError = forgotEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail) ? "Ingresa un email válido" : "";

	const canSubmitLogin = employeeNumber.trim() && password && isValidEmployeeNumber(employeeNumber) && isValidPassword(password);
	const canSubmitForgot = forgotEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail);

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!canSubmitLogin) return;
		await login({ employeeNumber: employeeNumber.trim(), password });
	};

	const handleForgotPassword = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!canSubmitForgot) return;

		setForgotError(null);
		setForgotLoading(true);
		const result = await authService.forgotPassword({ email: forgotEmail });
		if (result.error) {
			setForgotError(result.error.message || "No se pudo enviar el correo. Intenta de nuevo.");
		} else {
			setForgotSuccess(true);
		}
		setForgotLoading(false);
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
					<BrandName>Folysoft</BrandName>
					<WelcomeText variant="body2">
						Bienvenido/a al sistema backoffice de Folysoft
					</WelcomeText>
				</LogoContainer>

				{view === "login" ? (
					<>
						{loginError && (
							<AlertContainer>
								<Alert severity="error" onClose={clearLoginError}>
									{loginError}
								</Alert>
							</AlertContainer>
						)}

						<Form onSubmit={handleLogin}>
							<StyledTextField
								label="Número de empleado *"
								placeholder="Ingresa tu número de empleado"
								type="text"
								inputMode="numeric"
								value={employeeNumber}
								onChange={(e) => setEmployeeNumber(e.target.value.replace(/\D/g, ""))}
								error={!!employeeNumberError}
								helperText={employeeNumberError}
								fullWidth
								autoComplete="username"
								autoFocus
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<BadgeIcon sx={{ color: "text.secondary", fontSize: 20 }} />
										</InputAdornment>
									),
								}}
							/>

							<StyledTextField
								label="Contraseña *"
								placeholder="Ingresa tu contraseña"
								type={showPassword ? "text" : "password"}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								error={!!passwordError}
								helperText={passwordError}
								fullWidth
								autoComplete="current-password"
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<LockIcon sx={{ color: "text.secondary", fontSize: 20 }} />
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
												{showPassword ? <VisibilityOff /> : <Visibility />}
											</IconButton>
										</InputAdornment>
									),
								}}
							/>

							<SubmitButton
								type="submit"
								variant="contained"
								fullWidth
								disabled={!canSubmitLogin || isLoading}
							>
								{isLoading ? <CircularProgress size={24} color="inherit" /> : "Ingresar"}
							</SubmitButton>

							<ForgotButton
								type="button"
								onClick={() => setView("forgot")}
							>
								¿Olvidaste tu contraseña? Recupérala aquí
							</ForgotButton>
						</Form>
					</>
				) : (
					<>
						<BackLink onClick={handleBackToLogin}>
							<ArrowBackIcon fontSize="small" />
							Volver al inicio de sesión
						</BackLink>

						<Typography variant="h5">Recuperar contraseña</Typography>
						<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
							Ingresa tu email y te enviaremos instrucciones
						</Typography>

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


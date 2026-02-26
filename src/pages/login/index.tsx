import { useState } from "react";
import Image from "next/image";
import { Alert, CircularProgress, InputAdornment, IconButton, Typography, Button } from "@mui/material";
import {
	Visibility,
	VisibilityOff,
	Badge as BadgeIcon,
	Lock as LockIcon,
} from "@mui/icons-material";
import { useAuth } from "@/hooks/useAuth";
import {
	PageContainer,
	LeftPanel,
	RightPanel,
	FormWrapper,
	LogoContainer,
	Form,
	StyledTextField,
	AlertContainer,
	RecoveryRow,
	RecoveryLink,
} from "@/styles/login/styles";

export default function LoginPage() {
	const { login, isLoading, error: loginError, clearError: clearLoginError } = useAuth();
	const [showPassword, setShowPassword] = useState(false);

	// Login form: one identifier (username or cellphone / employee number) + password
	const [identifier, setIdentifier] = useState("");
	const [password, setPassword] = useState("");

	const trimmedId = identifier.trim();
	const isCellphone = /^\d+$/.test(trimmedId) && trimmedId.length >= 10;
	const isValidPassword = (value: string) => value.length >= 8;

	const identifierError = "";
	const passwordError = password && !isValidPassword(password) ? "La contraseña debe tener al menos 8 caracteres" : "";

	const canSubmitLogin =
		trimmedId.length > 0 &&
		password &&
		isValidPassword(password);

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!canSubmitLogin) return;
		await login(
			isCellphone
				? { cellphone: trimmedId, password }
				: { username: trimmedId, password }
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
					<Typography variant="h1">Ingresa a tu cuenta</Typography>
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
							value={identifier}
							onChange={(e) => setIdentifier(e.target.value)}
							error={!!identifierError}
							helperText={identifierError}
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
							label="Ingresa tu contraseña *"
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
						<Button variant="contained" color="primary" fullWidth disabled={isLoading}>
							{isLoading ? <CircularProgress size={24} color="inherit" /> : "Ingresar"}
						</Button>
					</Form>

					<RecoveryRow>
						<Typography variant="body2" color="text.secondary">¿Olvidaste tu contraseña?</Typography>
						<RecoveryLink href="#" onClick={(e: React.MouseEvent) => e.preventDefault()}>
							Recuperar
						</RecoveryLink>
					</RecoveryRow>
				</FormWrapper>
			</RightPanel>
		</PageContainer >
	);
}


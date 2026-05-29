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
import { parseLoginIdentifier } from "@/utils/login-identifier";
import {
	PageContainer,
	LeftPanel,
	RightPanel,
	FormWrapper,
	LogoContainer,
	Form,
	StyledTextField,
	RecoveryRow,
	RecoveryLink,
} from "@/styles/login/styles";

export default function LoginPage() {
	const { login, isLoading, error, clearError } = useAuth();
	const [showPassword, setShowPassword] = useState(false);

	const [identifier, setIdentifier] = useState("");
	const [password, setPassword] = useState("");

	const trimmedId = identifier.trim();
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
					<Typography variant="h1">Ingresa a tu cuenta</Typography>

					{error && (
						<Alert severity="error" onClose={clearError} sx={{ mb: 2 }}>
							{error}
						</Alert>
					)}

					<Form onSubmit={handleLogin}>
						<StyledTextField
							label="Número de empleado *"
							placeholder="Ingresa tu número de empleado"
							type="text"
							value={identifier}
							onChange={(e) => {
								clearError();
								setIdentifier(e.target.value);
							}}
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
						<RecoveryLink href="#" onClick={(e: React.MouseEvent) => e.preventDefault()}>
							Recuperar
						</RecoveryLink>
					</RecoveryRow>
				</FormWrapper>
			</RightPanel>
		</PageContainer >
	);
}


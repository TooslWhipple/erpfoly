import { useState } from "react";
import Image from "next/image";
import { CircularProgress, InputAdornment, IconButton, Typography, Button, useTheme } from "@mui/material";
import { useRouter } from "next/router";
import { Eye, EyeOff, IdCard, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { parseLoginIdentifier } from "@/utils/login-identifier";
import {
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
	const hasLoginError = !!error;

	const canSubmitLogin = trimmedId.length > 0 && password.length > 0 && !isLoading;

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
					<Typography variant="h1" textAlign="center">Ingresa a tu cuenta</Typography>

					<Form id="login-form" method="post" action="/login" onSubmit={handleLogin}>
						<StyledTextField
							id="username"
							name="username"
							label="Número de empleado *"
							placeholder="Ingresa tu número de empleado"
							type="text"
							value={identifier}
							onChange={(e) => {
								clearError();
								setIdentifier(sanitizeIdentifierInput(e.target.value));
							}}
							disabled={isLoading}
							error={hasLoginError}
							helperText=""
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
							id="password"
							name="password"
							label="Ingresa tu contraseña *"
							placeholder="Ingresa tu contraseña"
							type={showPassword ? "text" : "password"}
							value={password}
							onChange={(e) => {
								clearError();
								setPassword(sanitizePasswordInput(e.target.value));
							}}
							disabled={isLoading}
							error={hasLoginError}
							helperText={error ?? ""}
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
											type="button"
											onClick={() => setShowPassword(!showPassword)}
											edge="end"
											size="small"
											disabled={isLoading}
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
							disabled={!canSubmitLogin}
						>
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


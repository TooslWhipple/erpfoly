import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import {
	Alert,
	Button,
	CircularProgress,
	InputAdornment,
	Typography,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon, Pin as PinIcon } from "@mui/icons-material";
import { useAuthStore } from "@/store/useAuthStore";
import { authService, type ResendOtpRequest } from "@/services/auth.service";
import { canAccessPath, getFirstAllowedRoute, normalizePathname } from "@/lib/routeAccess";
import {
	PageContainer,
	LeftPanel,
	RightPanel,
	LogoContainer,
	FormWrapper,
	Form,
	StyledTextField,
	BackLink,
	RecoveryRow,
} from "@/styles/login/styles";

const OTP_LENGTH = 6;
const OTP_REGEX = /^\d{6}$/;

export default function ValidateOtpPage() {
	const router = useRouter();
	const setAuth = useAuthStore((s) => s.setAuth);

	const [otp, setOtp] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [resendLoading, setResendLoading] = useState(false);
	const [resendSuccess, setResendSuccess] = useState(false);
	const [resendError, setResendError] = useState<string | null>(null);

	const otpTrimmed = otp.replace(/\D/g, "").slice(0, OTP_LENGTH);
	const isValidOtp = OTP_REGEX.test(otpTrimmed);
	const canSubmit = isValidOtp && !loading;

	const handleBackToLogin = (event: React.MouseEvent<HTMLAnchorElement>) => {
		event.preventDefault();
		router.push("/login");
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!canSubmit) return;

		setError(null);
		setLoading(true);

		const result = await authService.validateOtp(otpTrimmed);

		if (result.error) {
			setError(result.error.message || "Código inválido o expirado. Intenta de nuevo.");
			setLoading(false);
			return;
		}

		setAuth(result.data!.token, result.data!.user);
		const redirect = typeof router.query.redirect === "string" ? normalizePathname(router.query.redirect) : "";
		const nextPath = redirect && canAccessPath(redirect, result.data!.user)
			? redirect
			: getFirstAllowedRoute(result.data!.user);
		router.push(nextPath);
		setLoading(false);
	};

	const handleResend = async () => {
		setResendError(null);
		setResendSuccess(false);
		setResendLoading(true);

		const identifier: ResendOtpRequest = {};
		const username = router.query.username;
		const cellphone = router.query.cellphone;
		if (typeof username === "string" && username) identifier.username = username;
		if (typeof cellphone === "string" && cellphone) identifier.cellphone = cellphone;

		const result = await authService.resendOtp(
			Object.keys(identifier).length > 0 ? identifier : undefined
		);

		if (result.error) {
			setResendError(result.error.message || "No se pudo reenviar el código.");
		} else {
			setResendSuccess(true);
		}
		setResendLoading(false);
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
					<Typography variant="h1">Verifica tu cuenta</Typography>

					<BackLink href="/login" onClick={handleBackToLogin}>
						<ArrowBackIcon fontSize="small" />
						Volver al inicio de sesión
					</BackLink>

					<Form onSubmit={handleSubmit}>
						<StyledTextField
							label="Código de verificación *"
							placeholder="Ingresa el código de 6 dígitos"
							type="text"
							inputMode="numeric"
							value={otpTrimmed}
							onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
							error={otp.length > 0 && !isValidOtp}
							helperText={
								otp.length > 0 && !isValidOtp
									? `Ingresa ${OTP_LENGTH} dígitos`
									: "Revisa el SMS que enviamos a tu teléfono"
							}
							fullWidth
							autoComplete="one-time-code"
							autoFocus
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<PinIcon sx={{ color: "text.secondary", fontSize: 20 }} />
									</InputAdornment>
								),
							}}
						/>

						{error && <Alert severity="error">{error}</Alert>}
						{resendError && <Alert severity="error">{resendError}</Alert>}
						{resendSuccess && (
							<Alert severity="success">Te enviamos un nuevo código.</Alert>
						)}

						<Button
							fullWidth
							type="submit"
							variant="contained"
							color="primary"
							disabled={!canSubmit}
						>
							{loading ? <CircularProgress size={24} color="inherit" /> : "Validar"}
						</Button>
					</Form>

					<RecoveryRow>
						<Typography variant="body2" color="text.secondary">¿No recibiste el código?</Typography>
						<Button
							variant="text"
							type="button"
							onClick={handleResend}
							disabled={resendLoading}
						>
							{resendLoading ? (
								<CircularProgress size={18} color="inherit" />
							) : (
								"Reenviar"
							)}
						</Button>
					</RecoveryRow>
				</FormWrapper>
			</RightPanel>
		</PageContainer>
	);
}

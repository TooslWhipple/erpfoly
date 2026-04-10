import { useState } from "react";
import { useRouter } from "next/router";
import {
	Alert,
	Box,
	Button,
	CircularProgress,
	InputAdornment,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon, Pin as PinIcon } from "@mui/icons-material";
import { useAuthStore } from "@/store/useAuthStore";
import { authService, type ResendOtpRequest } from "@/services/auth.service";
import {
	SimplePageContainer,
	LoginCard,
	LogoContainer,
	BrandName,
	WelcomeText,
	Form,
	StyledTextField,
	AlertContainer,
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
		router.push("/solicitudes-credito");
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
		<SimplePageContainer>
			<LoginCard>
				<LogoContainer>
					<BrandName>Folysoft</BrandName>
					<WelcomeText variant="body2">
						Ingresa el código de verificación que recibiste por SMS
					</WelcomeText>
				</LogoContainer>

				<Box
					component="button"
					type="button"
					onClick={() => router.push("/login")}
					sx={{
						display: "flex",
						alignItems: "center",
						gap: 0.5,
						fontSize: 14,
						cursor: "pointer",
						border: "none",
						background: "none",
						padding: 0,
						color: "text.secondary",
						"&:hover": { color: "text.primary" },
						mb: 2,
					}}
				>
					<ArrowBackIcon fontSize="small" />
					Volver al inicio de sesión
				</Box>

				{error && (
					<AlertContainer>
						<Alert severity="error" onClose={() => setError(null)}>
							{error}
						</Alert>
					</AlertContainer>
				)}

				{resendSuccess && (
					<AlertContainer>
						<Alert severity="success" onClose={() => setResendSuccess(false)}>
							Código reenviado. Revisa tu SMS.
						</Alert>
					</AlertContainer>
				)}

				{resendError && (
					<AlertContainer>
						<Alert severity="error" onClose={() => setResendError(null)}>
							{resendError}
						</Alert>
					</AlertContainer>
				)}

				<Form onSubmit={handleSubmit}>
					<StyledTextField
						label="Código OTP"
						placeholder="000000"
						type="text"
						inputMode="numeric"
						value={otpTrimmed}
						onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
						error={otp.length > 0 && !isValidOtp}
						helperText={
							otp.length > 0 && !isValidOtp
								? `Ingresa ${OTP_LENGTH} dígitos`
								: ""
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

					<Button
						variant="contained"
						fullWidth
						disabled={loading}
						onClick={handleSubmit}
					>
						{loading ? (
							<CircularProgress size={24} color="inherit" />
						) : (
							"Validar"
						)}
					</Button>

					<Button
						variant="text"
						type="button"
						onClick={handleResend}
						disabled={resendLoading}
					>
						{resendLoading ? (
							<CircularProgress size={18} color="inherit" />
						) : (
							"Reenviar código"
						)}
					</Button>
				</Form>
			</LoginCard>
		</SimplePageContainer>
	);
}

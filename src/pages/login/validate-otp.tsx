import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import {
	Button,
	CircularProgress,
	InputAdornment,
	Typography,
	useTheme,
} from "@mui/material";
import { ArrowLeft, KeyRound } from "lucide-react";
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

type FeedbackState = {
	message: string;
	severity: "error" | "success";
} | null;

export default function ValidateOtpPage() {
	const router = useRouter();
	const theme = useTheme();
	const setAuth = useAuthStore((s) => s.setAuth);

	const [otp, setOtp] = useState("");
	const [loading, setLoading] = useState(false);
	const [feedback, setFeedback] = useState<FeedbackState>(null);

	const [resendLoading, setResendLoading] = useState(false);

	const otpTrimmed = otp.replace(/\D/g, "").slice(0, OTP_LENGTH);
	const isValidOtp = OTP_REGEX.test(otpTrimmed);
	const canSubmit = isValidOtp && !loading;

	const otpFieldError =
		otp.length > 0 && !isValidOtp ? `Ingresa ${OTP_LENGTH} dígitos` : "";
	const feedbackError = feedback?.severity === "error" ? feedback.message : "";
	const feedbackSuccess = feedback?.severity === "success" ? feedback.message : "";
	const otpHelperText =
		otpFieldError ||
		feedbackError ||
		feedbackSuccess ||
		"Revisa el mensaje de WhatsApp que enviamos a tu teléfono";
	const otpHasError = !!otpFieldError || !!feedbackError;
	const otpHasSuccess = !otpHasError && !!feedbackSuccess;

	const handleBackToLogin = (event: React.MouseEvent<HTMLAnchorElement>) => {
		event.preventDefault();
		router.push("/login");
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!canSubmit) return;

		setFeedback(null);
		setLoading(true);

		const result = await authService.validateOtp(otpTrimmed);

		if (result.error) {
			setFeedback({
				message: result.error.message || "Código de verificación no válido o expirado. Intenta de nuevo.",
				severity: "error",
			});
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
		setFeedback(null);
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
			setFeedback({
				message: result.error.message || "No se pudo reenviar el código.",
				severity: "error",
			});
		} else {
			setFeedback({
				message: "Te enviamos un nuevo código.",
				severity: "success",
			});
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
					<Typography variant="h1" textAlign="center">Verifica tu cuenta</Typography>

					<BackLink href="/login" onClick={handleBackToLogin}>
						<ArrowLeft size={16} color={theme.palette.text.secondary} />
						Volver al inicio de sesión
					</BackLink>

					<Form onSubmit={handleSubmit}>
						<StyledTextField
							label="Código de verificación *"
							placeholder="Ingresa el código de 6 dígitos"
							type="text"
							inputMode="numeric"
							value={otpTrimmed}
							onChange={(e) => {
								setFeedback(null);
								setOtp(e.target.value.replace(/\D/g, ""));
							}}
							error={otpHasError}
							helperText={otpHelperText}
							FormHelperTextProps={
								otpHasSuccess ? { sx: { color: "success.main" } } : undefined
							}
							fullWidth
							autoComplete="one-time-code"
							autoFocus
							disabled={loading}
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<KeyRound size={20} color={theme.palette.text.secondary} />
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

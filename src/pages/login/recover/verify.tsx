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
import { ArrowLeft, KeyRound } from "lucide-react";
import { usePasswordRecovery } from "@/hooks/usePasswordRecovery";
import { isValidCellphone } from "@/utils/auth-credentials";
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

export default function RecoverPasswordVerifyPage() {
	const router = useRouter();
	const theme = useTheme();
	const { verifyRecovery, resendRecoveryCode, isLoading, error, clearError } =
		usePasswordRecovery();

	const [otp, setOtp] = useState("");
	const [resendLoading, setResendLoading] = useState(false);
	const [resendSuccess, setResendSuccess] = useState(false);

	const cellphone =
		typeof router.query.cellphone === "string" ? router.query.cellphone : "";
	const hasValidCellphone = isValidCellphone(cellphone);

	// Sin celular en la URL no hay a quién verificar: vuelve al primer paso.
	useEffect(() => {
		if (router.isReady && !hasValidCellphone) {
			void router.replace("/login/recover");
		}
	}, [router, hasValidCellphone]);

	const otpTrimmed = otp.replace(/\D/g, "").slice(0, OTP_LENGTH);
	const isValidOtp = OTP_REGEX.test(otpTrimmed);
	const canSubmit = hasValidCellphone && isValidOtp && !isLoading;

	const otpFieldError =
		otp.length > 0 && !isValidOtp ? `Ingresa ${OTP_LENGTH} dígitos` : "";
	const otpHasError = !!otpFieldError || !!error;
	const otpHasSuccess = !otpHasError && resendSuccess;
	const otpHelperText =
		otpFieldError ||
		error ||
		(resendSuccess ? "Si el número está registrado, te enviamos un nuevo código." : "") ||
		"Revisa el mensaje de WhatsApp que enviamos a tu teléfono";

	const handleBack = (event: React.MouseEvent<HTMLAnchorElement>) => {
		event.preventDefault();
		router.push("/login/recover");
	};

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		if (!canSubmit) return;
		setResendSuccess(false);
		await verifyRecovery(cellphone, otpTrimmed);
	};

	const handleResend = async () => {
		setResendSuccess(false);
		setResendLoading(true);
		const accepted = await resendRecoveryCode(cellphone);
		setResendSuccess(accepted);
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
					<Typography variant="h1" textAlign="center">Verifica tu celular</Typography>

					<BackLink href="/login/recover" onClick={handleBack}>
						<ArrowLeft size={16} color={theme.palette.text.secondary} />
						Cambiar número de celular
					</BackLink>

					<Typography variant="body2" color="text.secondary" textAlign="center">
						Ingresa el código que te enviamos por WhatsApp. Al validarlo, te enviaremos una contraseña temporal.
					</Typography>

					<Form onSubmit={handleSubmit}>
						<StyledTextField
							label="Código de verificación *"
							placeholder="Ingresa el código de 6 dígitos"
							type="text"
							inputMode="numeric"
							value={otpTrimmed}
							onChange={(event) => {
								clearError();
								setResendSuccess(false);
								setOtp(event.target.value.replace(/\D/g, ""));
							}}
							error={otpHasError}
							helperText={otpHelperText}
							FormHelperTextProps={
								otpHasSuccess ? { sx: { color: "success.main" } } : undefined
							}
							fullWidth
							autoComplete="one-time-code"
							autoFocus
							disabled={isLoading}
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
							{isLoading ? <CircularProgress size={24} color="inherit" /> : "Validar"}
						</Button>
					</Form>

					<RecoveryRow>
						<Typography variant="body2" color="text.secondary">¿No recibiste el código?</Typography>
						<Button
							variant="text"
							type="button"
							onClick={handleResend}
							disabled={resendLoading || !hasValidCellphone}
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

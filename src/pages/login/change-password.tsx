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
import { Lock } from "lucide-react";
import { PasswordFieldAdornment } from "@/components/PasswordFieldAdornment";
import { authService } from "@/services/auth.service";
import {
	getPasswordValidationError,
	isValidPassword,
	sanitizePasswordInput,
} from "@/utils/auth-credentials";
import {
	clearTempPasswordChangeContext,
	readTempPasswordChangeContext,
} from "@/utils/temp-password-change";
import {
	PageContainer,
	LeftPanel,
	RightPanel,
	LogoContainer,
	FormWrapper,
	Form,
	StyledTextField,
} from "@/styles/login/styles";

export default function ChangePasswordPage() {
	const router = useRouter();
	const theme = useTheme();

	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [ready, setReady] = useState(false);

	useEffect(() => {
		if (!router.isReady) return;

		const context = readTempPasswordChangeContext();
		if (!context) {
			void router.replace("/login");
			return;
		}

		setReady(true);
	}, [router]);

	const newPasswordError = getPasswordValidationError(newPassword);
	const confirmPasswordError =
		confirmPassword.length > 0 && newPassword !== confirmPassword
			? "Las contraseñas no coinciden"
			: "";
	const canSubmit =
		isValidPassword(newPassword) &&
		newPassword === confirmPassword &&
		!loading &&
		ready;

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		if (!canSubmit) return;

		const context = readTempPasswordChangeContext();
		if (!context) {
			void router.replace("/login");
			return;
		}

		setError(null);
		setLoading(true);

		const result = await authService.replaceTemporaryPassword({
			username: context.username,
			cellphone: context.cellphone,
			currentPassword: context.currentPassword,
			newPassword,
			confirmPassword,
		});

		if (result.error) {
			setError(result.error.message);
			setLoading(false);
			return;
		}

		clearTempPasswordChangeContext();
		void router.replace("/login?passwordChanged=1");
		setLoading(false);
	};

	if (!ready) {
		return (
			<PageContainer>
				<LeftPanel />
				<RightPanel>
					<LogoContainer>
						<Image src="/logo/foly-login.svg" alt="foly" width={44} height={24} priority />
					</LogoContainer>
					<FormWrapper sx={{ alignItems: "center" }}>
						<CircularProgress />
					</FormWrapper>
				</RightPanel>
			</PageContainer>
		);
	}

	return (
		<PageContainer>
			<LeftPanel />
			<RightPanel>
				<LogoContainer>
					<Image src="/logo/foly-login.svg" alt="foly" width={44} height={24} priority />
				</LogoContainer>

				<FormWrapper>
					<Typography variant="h1" textAlign="center">
						Crea tu nueva contraseña
					</Typography>

					<Form onSubmit={handleSubmit}>
						<StyledTextField
							label="Nueva contraseña *"
							type={showNewPassword ? "text" : "password"}
							value={newPassword}
							onChange={(event) => {
								setError(null);
								setNewPassword(sanitizePasswordInput(event.target.value));
							}}
							error={!!newPasswordError || !!error}
							helperText={newPasswordError || error || "Mínimo 8 caracteres, con mayúscula, minúscula y número"}
							fullWidth
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<Lock size={20} color={theme.palette.text.secondary} />
									</InputAdornment>
								),
								endAdornment: (
									<PasswordFieldAdornment
										length={newPassword.length}
										showPassword={showNewPassword}
										onToggleVisibility={() => setShowNewPassword((value) => !value)}
										iconColor={theme.palette.text.secondary}
										disabled={loading}
									/>
								),
							}}
						/>

						<StyledTextField
							label="Confirmar contraseña *"
							type={showConfirmPassword ? "text" : "password"}
							value={confirmPassword}
							onChange={(event) => {
								setError(null);
								setConfirmPassword(sanitizePasswordInput(event.target.value));
							}}
							error={!!confirmPasswordError}
							helperText={confirmPasswordError}
							fullWidth
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<Lock size={20} color={theme.palette.text.secondary} />
									</InputAdornment>
								),
								endAdornment: (
									<PasswordFieldAdornment
										length={confirmPassword.length}
										showPassword={showConfirmPassword}
										onToggleVisibility={() => setShowConfirmPassword((value) => !value)}
										iconColor={theme.palette.text.secondary}
										showCounter={false}
										disabled={loading}
									/>
								),
							}}
						/>

						<Typography variant="body2" color="text.secondary" textAlign="center">
							Estás usando una contraseña temporal. Define una contraseña permanente y luego inicia sesión con ella.
						</Typography>

						<Button
							fullWidth
							type="submit"
							variant="contained"
							color="primary"
							disabled={!canSubmit}
						>
							{loading ? <CircularProgress size={24} color="inherit" /> : "Guardar contraseña"}
						</Button>
					</Form>
				</FormWrapper>
			</RightPanel>
		</PageContainer>
	);
}

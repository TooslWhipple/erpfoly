import { Box, IconButton, InputAdornment, Typography } from "@mui/material";
import { Eye, EyeOff } from "lucide-react";
import { PASSWORD_MAX_LENGTH } from "@/utils/auth-credentials";

interface PasswordFieldAdornmentProps {
	length: number;
	maxLength?: number;
	showPassword: boolean;
	onToggleVisibility: () => void;
	iconColor: string;
	showCounter?: boolean;
}

export function PasswordFieldAdornment({
	length,
	maxLength = PASSWORD_MAX_LENGTH,
	showPassword,
	onToggleVisibility,
	iconColor,
	showCounter = true,
}: PasswordFieldAdornmentProps) {
	return (
		<InputAdornment position="end">
			<Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
				{showCounter && (
					<Typography
						component="span"
						variant="caption"
						color="text.secondary"
						sx={{ fontSize: 12, minWidth: 44, textAlign: "right", userSelect: "none" }}
					>
						{length}/{maxLength}
					</Typography>
				)}
				<IconButton
					onClick={onToggleVisibility}
					edge="end"
					size="small"
					aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
				>
					{showPassword ? <EyeOff size={20} color={iconColor} /> : <Eye size={20} color={iconColor} />}
				</IconButton>
			</Box>
		</InputAdornment>
	);
}

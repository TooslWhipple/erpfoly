import { styled } from "@mui/material/styles";
import { Box, Paper, Typography, TextField, Button, Link } from "@mui/material";
import { colors } from "@/styles/theme";

export const PageContainer = styled(Box)({
	minHeight: "100vh",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	backgroundColor: colors.background.main,
	padding: 16,
});

export const LoginCard = styled(Paper)(({ theme }) => ({
	width: "100%",
	maxWidth: 400,
	padding: theme.spacing(4),
	borderRadius: 12,
	border: `1px solid ${colors.border}`,
	boxShadow: "0 4px 24px rgba(0, 0, 0, 0.06)",
	[theme.breakpoints.down("sm")]: {
		padding: theme.spacing(3),
	},
}));

export const LogoContainer = styled(Box)(({ theme }) => ({
	display: "flex",
	flexDirection: "column",
	alignItems: "center",
	justifyContent: "center",
	gap: theme.spacing(1),
	marginBottom: theme.spacing(3),
}));

export const BrandName = styled(Typography)(({ theme }) => ({
	fontSize: 24,
	fontWeight: 700,
	color: theme.palette.text.primary,
}));

export const WelcomeText = styled(Typography)(({ theme }) => ({
	textAlign: "center",
	color: theme.palette.text.secondary,
	fontSize: 14,
	marginBottom: theme.spacing(3),
}));

export const Title = styled(Typography)(({ theme }) => ({
	textAlign: "center",
	marginBottom: theme.spacing(1),
}));

export const Subtitle = styled(Typography)(({ theme }) => ({
	textAlign: "center",
	marginBottom: theme.spacing(3),
}));

export const Form = styled("form")(({ theme }) => ({
	display: "flex",
	flexDirection: "column",
	gap: theme.spacing(2.5),
}));

export const StyledTextField = styled(TextField)({
	"& .MuiOutlinedInput-root": {
		backgroundColor: colors.background.sidebar,
		"& fieldset": {
			borderColor: colors.border,
		},
		"&:hover fieldset": {
			borderColor: colors.border,
		},
		"&.Mui-focused fieldset": {
			borderColor: colors.sidebar.textSelected,
		},
	},
});

export const AlertContainer = styled(Box)(({ theme }) => ({
	marginBottom: theme.spacing(2),
}));

export const BackLink = styled(Link)(({ theme }) => ({
	display: "flex",
	alignItems: "center",
	gap: 4,
	fontSize: 14,
	cursor: "pointer",
	textDecoration: "none",
	color: theme.palette.text.secondary,
	marginBottom: theme.spacing(2),
	"&:hover": {
		color: theme.palette.text.primary,
	},
}));


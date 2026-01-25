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

export const LogoContainer = styled(Box)({
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	gap: 8,
	marginBottom: 32,
});

export const LogoBox = styled(Box)({
	width: 40,
	height: 40,
	borderRadius: 6,
	backgroundColor: "#EF4444",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
});

export const LogoText = styled(Typography)({
	color: "white",
	fontWeight: 700,
	fontSize: 14,
});

export const BrandName = styled(Typography)({
	fontSize: 24,
	fontWeight: 700,
	color: "#232325",
});

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

export const SubmitButton = styled(Button)(({ theme }) => ({
	marginTop: theme.spacing(1),
	height: 44,
	fontSize: 15,
	fontWeight: 600,
}));

export const ForgotLink = styled(Link)({
	fontSize: 14,
	cursor: "pointer",
	textDecoration: "none",
	color: colors.sidebar.textSelected,
	"&:hover": {
		textDecoration: "underline",
	},
});

export const BackLink = styled(Link)(({ theme }) => ({
	display: "flex",
	alignItems: "center",
	gap: 4,
	fontSize: 14,
	cursor: "pointer",
	textDecoration: "none",
	color: "#71717A",
	marginBottom: theme.spacing(2),
	"&:hover": {
		color: "#232325",
	},
}));

export const AlertContainer = styled(Box)(({ theme }) => ({
	marginBottom: theme.spacing(2),
}));


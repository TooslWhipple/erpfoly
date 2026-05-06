import { styled } from "@mui/material/styles";
import { Box, Typography, TextField, Link } from "@mui/material";
import { theme } from "@/styles/theme";

export const SimplePageContainer = styled(Box)({
	minHeight: "100vh",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	backgroundColor: theme.palette.background.default,
	padding: 16,
});

export const PageContainer = styled(Box)({
	minHeight: "100vh",
	display: "flex",
	flexDirection: "row",
	alignItems: "stretch",
	overflow: "hidden",
});

export const LeftPanel = styled(Box)({
	flex: "0 0 42%",
	minHeight: "100vh",
	backgroundImage: "url(/backgrounds/login-background.png)",
	backgroundSize: "cover",
	backgroundPosition: "center",
	backgroundRepeat: "no-repeat",
	"@media (max-width: 900px)": {
		display: "none",
	},
});

export const RightPanel = styled(Box)(({ theme }) => ({
	display: "flex",
	flexDirection: "column",
	flex: 1,
	minWidth: 0,
	alignItems: "center",
	justifyContent: "center",
	backgroundColor: "#FFFFFF",
	padding: "48px 0px",
}));

export const FormWrapper = styled(Box)(({ theme }) => ({
	display: "flex",
	flexDirection: "column",
	alignItems: "center",
	width: "100%",
	maxWidth: "560px",
	gap: "32px"
}));

export const LogoContainer = styled(Box)(({ theme }) => ({
	display: "flex",
	justifyContent: "center",
	marginBottom: "64px"
}));

export const Form = styled("form")(({ theme }) => ({
	display: "flex",
	flexDirection: "column",
	width: "100%",
	gap: "24px",
}));

export const StyledTextField = styled(TextField)({
	"& .MuiOutlinedInput-root": {
		backgroundColor: "#FFFFFF",
		"& fieldset": {
			borderColor: "#D4D4D8",
		},
		"&:hover fieldset": {
			borderColor: "#A1A1AA",
		},
		"&.Mui-focused fieldset": {
			borderColor: theme.palette.app.sidebar.textSelected,
			borderWidth: "1px",
		},
	},
	"& .MuiInputLabel-root": {
		color: theme.palette.text.secondary,
	},
	"& .MuiInputLabel-root.Mui-focused": {
		color: theme.palette.text.secondary,
	},
});

export const AlertContainer = styled(Box)(({ theme }) => ({
	width: "100%",
	marginBottom: theme.spacing(2),
}));

export const RecoveryRow = styled(Box)(({ theme }) => ({
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	gap: "8px",
	flexWrap: "wrap",
}));

export const RecoveryLink = styled(Link)(({ theme }) => ({
	fontSize: 14,
	fontWeight: 500,
	color: theme.palette.primary.main,
	cursor: "pointer",
	textDecoration: "none",
	"&:hover": {
		textDecoration: "underline",
	},
}));

/** Card-style wrapper for form (used by login and validate-otp). */
export const LoginCard = styled(Box)(({ theme }) => ({
	width: "100%",
	maxWidth: 400,
	padding: theme.spacing(4),
	display: "flex",
	flexDirection: "column",
	alignItems: "center",
	[theme.breakpoints.down("sm")]: {
		padding: theme.spacing(3),
	},
}));

export const BrandName = styled(Typography)(({ theme }) => ({
	textAlign: "center",
	fontSize: 24,
	fontWeight: 700,
	color: theme.palette.text.primary,
	marginBottom: theme.spacing(1),
}));

export const WelcomeText = styled(Typography)(({ theme }) => ({
	textAlign: "center",
	color: theme.palette.text.secondary,
	fontSize: 14,
	marginBottom: theme.spacing(3),
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

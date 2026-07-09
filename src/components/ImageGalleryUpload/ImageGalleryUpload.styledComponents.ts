import { styled, darken } from "@mui/material/styles";

export const GalleryGrid = styled("div")(({ theme }) => ({
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: theme.spacing(2),
    marginTop: theme.spacing(2),
}));

export const GalleryItem = styled("div")(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    position: "relative",
    borderRadius: "8px",
    overflow: "hidden",
    border: `1px solid ${theme.palette.app.border}`,
    backgroundColor: theme.palette.background.paper,
    cursor: "pointer",
    padding: "12px",
    "&:hover": {
        borderColor: theme.palette.app.sidebar.textSelected,
        "& > div": {
            border: `1px dashed ${theme.palette.app.sidebar.textSelected}`,
        },
        "& > div[data-gallery-overlay]": {
            opacity: 1,
        },
    },
}));

export const GalleryImage = styled("img")({
    width: "100%",
    height: "240px",
    maxHeight: "240px",
    objectFit: "cover",
    borderRadius: "8px",
});

export const GalleryAddButton = styled("div")(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    width: "100%",
    height: "240px",
    maxHeight: "240px",
    backgroundColor: theme.palette.app.background.lowerGray,
    border: `1px dashed ${theme.palette.app.background.lowBlue}`,
    borderRadius: "8px",
    cursor: "pointer",
    transition: "border-color 0.2s ease",
}));

export const GalleryOverlay = styled("div")(({ theme }) => ({
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing(1),
    opacity: 0,
    transition: "opacity 0.2s ease",
    zIndex: 2,
}));

export const GalleryIconButton = styled("div")(({ theme }) => ({
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.app.border}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s ease",
    "& svg": {
        fontSize: 20,
        color: theme.palette.text.primary,
    },
    "&:hover": {
        backgroundColor: darken(theme.palette.background.paper, 0.15),
        borderColor: darken(theme.palette.app.sidebar.textSelected, 0.15),
    },
}));

export const HiddenFileInput = styled("input")({
    display: "none",
});

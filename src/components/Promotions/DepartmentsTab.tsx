import { useState, useMemo } from "react";
import { styled } from "@mui/material/styles";
import { Box, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Checkbox, InputAdornment, Chip } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { FormTextField } from "@/components";
import { MultiSelectChips } from "@/components/MultiSelectChips";
import { Section, SectionTitle, SectionDescription } from "@/styles/catalogos/productos.styles";
import type { PromotionFormState, PromotionDepartment, PromotionArticle } from "@/types/promociones.types";
import { MOCK_DEPARTMENTS, MOCK_ARTICLES } from "@/data/promociones.mockData";

// ============================================================================
// TYPES
// ============================================================================

interface DepartmentsTabProps {
    formState: PromotionFormState;
    onFieldChange: (field: keyof PromotionFormState, value: any) => void;
}

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const ArticlesTableContainer = styled(TableContainer)(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 8,
    marginTop: theme.spacing(2),
    maxHeight: 500,
    overflow: "auto",
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
    backgroundColor: theme.palette.background.default,
    position: "sticky",
    top: 0,
    zIndex: 1,
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    fontSize: "0.875rem",
    fontWeight: 600,
    color: theme.palette.text.primary,
    borderBottom: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(1.5, 2),
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    "&:hover": {
        backgroundColor: theme.palette.action.hover,
    },
    "&:last-child td": {
        borderBottom: "none",
    },
}));

const ArticleTableCell = styled(TableCell)(({ theme }) => ({
    fontSize: "0.875rem",
    color: theme.palette.text.primary,
    padding: theme.spacing(1.5, 2),
    borderBottom: `1px solid ${theme.palette.divider}`,
}));

const StatusChip = styled(Chip)<{ status: "Activo" | "Draft" }>(({ theme, status }) => ({
    fontSize: "0.75rem",
    height: 24,
    backgroundColor: status === "Activo" ? "#dcfce7" : "#f3f4f6",
    color: status === "Activo" ? "#16a34a" : "#6b7280",
    fontWeight: 500,
}));

const SearchContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: theme.spacing(2),
}));

// ============================================================================
// COMPONENT
// ============================================================================

export function DepartmentsTab({
    formState,
    onFieldChange,
}: DepartmentsTabProps) {
    const [searchTerm, setSearchTerm] = useState("");

    // Convert departments to SelectableItem format
    const departmentItems = useMemo(() => {
        return MOCK_DEPARTMENTS.map((dept) => ({
            id: dept.id,
            label: `${dept.code} - ${dept.name}`,
        }));
    }, []);

    // Filter articles based on selected departments and search term
    const filteredArticles = useMemo(() => {
        let articles = MOCK_ARTICLES;

        // Filter by selected departments
        if (formState.selectedDepartmentIds.length > 0) {
            articles = articles.filter((article) => {
                const articleDeptCode = article.department.split(" - ")[0];
                return formState.selectedDepartmentIds.some((deptId) => {
                    const dept = MOCK_DEPARTMENTS.find((d) => d.id === deptId);
                    return dept && dept.code === articleDeptCode;
                });
            });
        }

        // Filter by search term
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            articles = articles.filter(
                (article) =>
                    article.code.toLowerCase().includes(searchLower) ||
                    article.name.toLowerCase().includes(searchLower)
            );
        }

        return articles;
    }, [formState.selectedDepartmentIds, searchTerm]);

    const handleDepartmentChange = (selectedIds: (string | number)[]) => {
        onFieldChange("selectedDepartmentIds", selectedIds);
    };

    const handleArticleToggle = (articleId: string) => {
        const currentIds = formState.selectedArticleIds || [];
        const isSelected = currentIds.includes(articleId);
        const newIds = isSelected
            ? currentIds.filter((id) => id !== articleId)
            : [...currentIds, articleId];
        onFieldChange("selectedArticleIds", newIds);
    };

    const handleSelectAllArticles = () => {
        const allSelected = filteredArticles.every((article) =>
            formState.selectedArticleIds?.includes(article.id)
        );
        if (allSelected) {
            // Deselect all filtered articles
            const filteredIds = filteredArticles.map((a) => a.id);
            onFieldChange(
                "selectedArticleIds",
                (formState.selectedArticleIds || []).filter(
                    (id) => !filteredIds.includes(id)
                )
            );
        } else {
            // Select all filtered articles
            const newIds = [
                ...new Set([
                    ...(formState.selectedArticleIds || []),
                    ...filteredArticles.map((a) => a.id),
                ]),
            ];
            onFieldChange("selectedArticleIds", newIds);
        }
    };

    const isAllSelected =
        filteredArticles.length > 0 &&
        filteredArticles.every((article) =>
            formState.selectedArticleIds?.includes(article.id)
        );

    return (
        <Box>
            {/* Departments Section */}
            <Section>
                <SectionTitle>Departamentos donde se aplicará la promoción</SectionTitle>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                        <Box sx={{ mb: 2 }}>
                            <Box sx={{ fontSize: "0.875rem", fontWeight: 500, mb: 1 }}>
                                Departamentos
                            </Box>
                            <MultiSelectChips
                                items={departmentItems}
                                selectedIds={formState.selectedDepartmentIds || []}
                                onChange={handleDepartmentChange}
                            />
                        </Box>
                    </Grid>
                </Grid>
            </Section>

            {/* Articles Section */}
            <Section>
                <SectionTitle>Artículos</SectionTitle>
                <SearchContainer>
                    <FormTextField
                        placeholder="Buscar"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{ width: 300 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                                </InputAdornment>
                            ),
                        }}
                    />
                </SearchContainer>

                <ArticlesTableContainer>
                    <Table>
                        <StyledTableHead>
                            <TableRow>
                                <StyledTableCell padding="checkbox" width={48}>
                                    <Checkbox
                                        checked={isAllSelected}
                                        indeterminate={
                                            !isAllSelected &&
                                            filteredArticles.some((article) =>
                                                formState.selectedArticleIds?.includes(article.id)
                                            )
                                        }
                                        onChange={handleSelectAllArticles}
                                    />
                                </StyledTableCell>
                                <StyledTableCell>Código</StyledTableCell>
                                <StyledTableCell>Estatus</StyledTableCell>
                                <StyledTableCell>Nombre</StyledTableCell>
                                <StyledTableCell>Departamento</StyledTableCell>
                                <StyledTableCell>Línea</StyledTableCell>
                                <StyledTableCell>Proveedor</StyledTableCell>
                                <StyledTableCell align="right">Precio</StyledTableCell>
                            </TableRow>
                        </StyledTableHead>
                        <TableBody>
                            {filteredArticles.length === 0 ? (
                                <TableRow>
                                    <ArticleTableCell colSpan={8} align="center" sx={{ py: 4, color: "text.secondary" }}>
                                        {searchTerm
                                            ? "No se encontraron artículos"
                                            : "Selecciona departamentos para ver artículos"}
                                    </ArticleTableCell>
                                </TableRow>
                            ) : (
                                filteredArticles.map((article) => {
                                    const isSelected = formState.selectedArticleIds?.includes(article.id) || false;
                                    return (
                                        <StyledTableRow key={article.id}>
                                            <ArticleTableCell padding="checkbox">
                                                <Checkbox
                                                    checked={isSelected}
                                                    onChange={() => handleArticleToggle(article.id)}
                                                />
                                            </ArticleTableCell>
                                            <ArticleTableCell>{article.code}</ArticleTableCell>
                                            <ArticleTableCell>
                                                <StatusChip
                                                    label={article.status}
                                                    status={article.status}
                                                    size="small"
                                                />
                                            </ArticleTableCell>
                                            <ArticleTableCell>{article.name}</ArticleTableCell>
                                            <ArticleTableCell>{article.department}</ArticleTableCell>
                                            <ArticleTableCell>{article.line}</ArticleTableCell>
                                            <ArticleTableCell>{article.supplier}</ArticleTableCell>
                                            <ArticleTableCell align="right">
                                                ${article.price.toLocaleString("es-MX", {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}
                                            </ArticleTableCell>
                                        </StyledTableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </ArticlesTableContainer>
            </Section>
        </Box>
    );
}

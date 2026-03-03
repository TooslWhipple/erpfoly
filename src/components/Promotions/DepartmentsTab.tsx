import { useState, useMemo } from "react";
import numeral from "numeral";

import { Box, Grid, Table, TableBody, TableRow, Checkbox, InputAdornment, Typography, Stack, TableContainer } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { FormTextField } from "@/components";
import { MultiSelectChips } from "@/components/MultiSelectChips";
import { FormCard } from "@/styles/catalogos/productos.styles";
import {
    StyledTableHead,
    StyledTableCell,
    StyledTableRow,
    ArticleTableCell,
    StatusChip,
    SearchContainer,
} from "@/styles/catalogos/promociones.styles";
import type { PromotionFormState } from "@/types/promociones.types";
import { MOCK_DEPARTMENTS, MOCK_ARTICLES } from "@/data/promociones.mockData";

interface DepartmentsTabProps {
    formState: PromotionFormState;
    onFieldChange: (field: keyof PromotionFormState, value: any) => void;
}

export function DepartmentsTab({
    formState,
    onFieldChange,
}: DepartmentsTabProps) {
    const [searchTerm, setSearchTerm] = useState("");

    const departmentItems = useMemo(() => {
        return MOCK_DEPARTMENTS.map((dept) => ({
            id: dept.id,
            label: `${dept.code} - ${dept.name}`,
        }));
    }, []);

    const filteredArticles = useMemo(() => {
        let articles = MOCK_ARTICLES;

        if (formState.selectedDepartmentIds.length > 0) {
            articles = articles.filter((article) => {
                const articleDeptCode = article.department.split(" - ")[0];
                return formState.selectedDepartmentIds.some((deptId) => {
                    const dept = MOCK_DEPARTMENTS.find((d) => d.id === deptId);
                    return dept && dept.code === articleDeptCode;
                });
            });
        }

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
            const filteredIds = filteredArticles.map((a) => a.id);
            onFieldChange(
                "selectedArticleIds",
                (formState.selectedArticleIds || []).filter(
                    (id) => !filteredIds.includes(id)
                )
            );
        } else {
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
        <>
            <FormCard>
                <Typography variant="h6">Departamentos donde se aplicará la promoción</Typography>
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
            </FormCard>

            <FormCard>
                <Stack direction="row" justifyContent="space-between" width="100%">
                    <Typography variant="h6">Artículos</Typography>
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
                </Stack>

                <TableContainer>
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
                                <StyledTableCell>Precio</StyledTableCell>
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
                                                {numeral(article.price).format("$0,0.00")}
                                            </ArticleTableCell>
                                        </StyledTableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </FormCard>
        </>
    );
}

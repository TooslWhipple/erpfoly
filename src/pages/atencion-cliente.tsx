import { useState } from "react";
import { useRouter } from "next/router";
import { Stack, InputAdornment, MenuItem, SelectChangeEvent } from "@mui/material";
import { Search as SearchIcon, Check as CheckIcon } from "@mui/icons-material";
import type { SearchType } from "@/types/atencion-cliente.types";
import { searchInvoices } from "@/data/atencion-cliente.mockData";
import {
    SearchPageContainer,
    LogoContainer,
    LogoText,
    VersionText,
    SearchBarContainer,
    SearchTypeSelect,
    SearchInput,
    SearchButton,
} from "@/styles/atencion-cliente.styles";

export default function AtencionCliente() {
    const router = useRouter();
    const [searchType, setSearchType] = useState<SearchType>("facturas");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSearchTypeChange = (event: SelectChangeEvent<unknown>) => {
        setSearchType(event.target.value as SearchType);
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            return;
        }

        setLoading(true);
        try {
            const results = await searchInvoices(searchQuery, searchType);
            
            if (results.length > 0) {
                const firstResult = results[0];
                const redirectPath = `/atencion-cliente/${firstResult.id}`;
                
                router.push(redirectPath).catch((err) => {
                    console.error("[AtencionCliente] Navigation error:", err);
                });
            } else {
                setLoading(false);
            }
        } catch (error) {
            console.error("[AtencionCliente] Search error:", error);
            setLoading(false);
        }
    };

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            handleSearch();
        }
    };

    return (
        <>
            <SearchPageContainer>
                <LogoContainer>
                    <LogoText>
                        <span className="foly">FoLy</span>
                        <span className="soft">Soft</span>
                    </LogoText>
                    <VersionText>V1.0</VersionText>
                </LogoContainer>

                <SearchBarContainer>
                    <SearchTypeSelect
                        value={searchType}
                        onChange={handleSearchTypeChange}
                        size="small"
                    >
                        <MenuItem value="facturas">
                            <Stack direction="row" alignItems="center" spacing={1}>
                                {searchType === "facturas" && <CheckIcon sx={{ fontSize: 16 }} />}
                                Facturas
                            </Stack>
                        </MenuItem>
                        <MenuItem value="clientes">
                            <Stack direction="row" alignItems="center" spacing={1}>
                                {searchType === "clientes" && <CheckIcon sx={{ fontSize: 16 }} />}
                                Clientes
                            </Stack>
                        </MenuItem>
                        <MenuItem value="pedidos">
                            <Stack direction="row" alignItems="center" spacing={1}>
                                {searchType === "pedidos" && <CheckIcon sx={{ fontSize: 16 }} />}
                                Pedidos
                            </Stack>
                        </MenuItem>
                    </SearchTypeSelect>

                    <SearchInput
                        placeholder={
                            searchType === "facturas"
                                ? "Buscar facturas o clientes..."
                                : searchType === "clientes"
                                ? "Buscar clientes..."
                                : "Buscar pedidos..."
                        }
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onKeyPress={handleKeyPress}
                        size="small"
                        fullWidth
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: "#71717A", fontSize: 20 }} />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <SearchButton
                        variant="contained"
                        color="primary"
                        onClick={handleSearch}
                        disabled={loading || !searchQuery.trim()}
                    >
                        Buscar
                    </SearchButton>
                </SearchBarContainer>
            </SearchPageContainer>
        </>
    );
}

"use client";

import React, { useState, useEffect } from "react";
import {
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TableContainer,
    Paper,
    Button,
    Box,
    TextField,
    TablePagination,
    CircularProgress
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export interface Category {
    id?: string;
    name: string;
    createdAt: Date|null;
    active: boolean;
}

interface Props {
    categories: Category[];
    loading: boolean;
    onEdit: (cat: Category) => void;
    onDelete: (cat: Category) => void;
}

const CategoryTable = ({ categories=[], loading, onEdit, onDelete }: Props) => {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    // Filtrar categorías
    const filtered = categories.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    // Paginación
    const paginated = filtered.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    return (
        <Paper sx={{ borderRadius: "12px", overflow: "hidden", p: 2 }}>

            {/* Filtro */}
            <Box mb={2}>
                <TextField
                    fullWidth
                    label="Buscar categoría..."
                    variant="outlined"
                    size="small"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </Box>

            {/* Tabla */}
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: "#e1eaff" }}>
                            <TableCell sx={{ fontWeight: "bold" }}>Nombre</TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>Creado</TableCell>
                            <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
                                Acciones
                            </TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                                 <CircularProgress />
                                               </TableCell>
                            </TableRow>
                        ) : paginated.length > 0 ? (
                            paginated.map((cat) => (
                                <TableRow key={cat.id} hover>
                                    <TableCell>{cat.name}</TableCell>

                                    <TableCell>
                                        {cat.createdAt ? cat.createdAt.toLocaleDateString() : "—"}
                                    </TableCell>

                                    <TableCell align="center">
                                        <Box className="flex gap-3 justify-center">

                                            <Button
                                                variant="contained"
                                                color="primary"
                                                size="small"
                                                startIcon={<EditIcon />}
                                                onClick={() => onEdit(cat)}
                                            >
                                                Editar
                                            </Button>

                                            <Button
                                                variant="contained"
                                                color="error"
                                                size="small"
                                                startIcon={<DeleteIcon />}
                                                onClick={() => onDelete(cat)}
                                            >
                                                Eliminar
                                            </Button>

                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3} align="center">
                                    No se encontraron categorías
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Paginación */}
            <TablePagination
                component="div"
                count={filtered.length}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                }}
                rowsPerPageOptions={[5, 10, 20]}
            />

        </Paper>
    );
};

export default CategoryTable;

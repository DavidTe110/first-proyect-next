
"use client";
import EditIcon from '@mui/icons-material/Edit';
import React, { useState } from "react";
import {
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TableContainer,
    Paper,
    Button,
    CircularProgress,
    Box,
    TextField,
    TablePagination
} from "@mui/material";

export interface User {
    id: string;
    email: string;
    name:string;
    role: "Empleado" | "Admin";
    status: boolean; // true = activo, false = no activo
    active:boolean
}
interface Props {
    users: User[];
    loading: boolean;
    onEdit: (user: User) => void;
    onDelete: (user: User) => void;
}

const UserTable = ({ users, loading, onEdit, onDelete }: Props) => {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    // Filtrado
    const filteredUsers = users.filter((u) =>
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.role.toLowerCase().includes(search.toLowerCase()) ||
        (u.status ? "activo" : "no activo").includes(search.toLowerCase())
    );

    // Paginación
    const paginatedUsers = filteredUsers.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    return (
        <Paper sx={{ borderRadius: "12px", overflow: "hidden", p: 2 }}>
            {/* Buscador */}
            <Box mb={2}>
                <TextField
                    fullWidth
                    label="Buscar usuario..."
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
                            <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>Rol</TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Acciones</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : paginatedUsers.length > 0 ? (
                            paginatedUsers.map((u) => (
                                <TableRow key={u.id} hover>
                                    <TableCell>{u.name}</TableCell>
                                    <TableCell>{u.email}</TableCell>
                                    <TableCell>
                                        <span
                                            className={`px-2 py-1 rounded text-white text-sm ${u.role === "Admin" ? "bg-orange-600" : "bg-green-500"
                                                }`}
                                        >
                                            {u.role}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span
                                            className={`px-2 py-1 rounded text-white text-sm ${u.status ? "bg-green-500" : "bg-gray-500"
                                                }`}
                                        >
                                            {u.status ? "Activo" : "No activo"}
                                        </span>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Box className="flex flex-wrap gap-3 mb-4 justify-center">
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                startIcon={<EditIcon />}
                                                size="small"
                                                onClick={() => onEdit(u)}
                                            >
                                                Editar
                                            </Button>
                                            <Button variant="contained" size="small" color="error"
                                                onClick={()=>onDelete(u)}
                                                startIcon={<EditIcon />}

                                            >Eliminar</Button>
                                        </Box>

                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} align="center">
                                    No se encontraron usuarios
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Paginación */}
            <TablePagination
                component="div"
                count={filteredUsers.length}
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

export default UserTable;

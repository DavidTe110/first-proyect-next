"use client";

import React, { useState } from "react";
import {
  Table, TableHead, TableBody, TableRow, TableCell,
  TableContainer, Paper, Button, CircularProgress, Box,
  TextField, TablePagination,
  Chip
} from "@mui/material";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";


interface Product {
  id?: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  status: boolean;
  createdAt?: Date;
  active: boolean;
}

interface Props {
  onAddCar: (product: Product) => void;
  products: Product[];
  loadingProducts: boolean;
}

const SalesTable = ({ onAddCar, products, loadingProducts }: Props) => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // ---- FILTRO ----
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  // ---- PAGINACIÓN ----
  const paginated = filteredProducts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  return (
    <Paper sx={{ borderRadius: "12px", overflow: "hidden", p: 2 }}>
      {/* BUSCADOR */}
      <Box className="flex flex-wrap gap-3 mb-4">
        <TextField
          label="Buscar producto por nombre..."
          size="small"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0); // resetear pagina al buscar
          }}
          className="flex-1 min-w-[200px]"
        />
      </Box>

      {/* TABLA */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#e1eaff" }}>
              <TableCell sx={{ fontWeight: "bold" }}>Nombre</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Precio</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Stock</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Acción</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loadingProducts ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : paginated.length > 0 ? (
              paginated.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>S/ {p.price}</TableCell>
                  <TableCell>
                    <Chip
                      label={ p.stock > 0  ? "DISPONIBLE" : "NO DISPONIBLE"}
                      color={ p.stock > 0  ? "success" : "error"}
                      size="small"
                    />

                  </TableCell>

                  <TableCell>
                    <Button
                      variant="contained"
                      size="small"
                      color="primary"
                      startIcon={<AddShoppingCartIcon />}
                      disabled={p.stock <= 0}
                      onClick={() => onAddCar(p)}
                    >
                      Agregar
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No se encontraron productos
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* PAGINACIÓN */}
      <TablePagination
        component="div"
        count={filteredProducts.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 20]}
      />
    </Paper>
  );
};

export default SalesTable;

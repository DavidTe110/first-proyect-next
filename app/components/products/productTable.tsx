"use client";

import React, { useEffect, useState } from "react";
import {
  Table, TableHead, TableBody, TableRow, TableCell,
  TableContainer, Paper, Button, CircularProgress, Box,
  TextField, TablePagination, MenuItem,
  Chip,

} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import QrCode2Icon from "@mui/icons-material/QrCode2";


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
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onQr: (product: Product) => void;
  products: Product[];
  categories: string[];
  loadingProducts: boolean;
  loadingCategories: boolean;
}

const ProductTable = ({
  onEdit,
  onDelete,
  onQr,
  products,
  categories,
  loadingProducts,
  loadingCategories
}: Props) => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const filteredProducts = products.filter(p => {
    const isAvailable = p.stock > 0;

    const nameMatch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());

    const categoryMatch =
      categoryFilter === "all" || p.category === categoryFilter;

    const stockMatch =
      stockFilter === "all" ||
      (stockFilter === "in" && isAvailable) ||
      (stockFilter === "out" && !isAvailable);

    const priceMatch =
      (!priceMin || p.price >= Number(priceMin)) &&
      (!priceMax || p.price <= Number(priceMax));

    return nameMatch && categoryMatch && stockMatch && priceMatch;
  });

  const paginatedProducts = filteredProducts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Paper sx={{ borderRadius: "12px", overflow: "hidden", p: 2 }}>
      {/* FILTROS */}
      <Box className="flex flex-wrap gap-3 mb-4">
        <TextField
          label="Buscar producto..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px]"
        />

        <TextField
          select
          label="Categoría"
          size="small"
          className="w-40"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <MenuItem value="all">Todas</MenuItem>

          {loadingCategories && (
            <MenuItem disabled>
              Cargando...
            </MenuItem>
          )}

          {!loadingCategories &&
            categories.map(cat => (
              <MenuItem key={cat} value={cat}>{cat}</MenuItem>
            ))
          }
        </TextField>

        <TextField
          select
          label="Stock"
          size="small"
          className="w-40"
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
        >
          <MenuItem value="all">Todos</MenuItem>
          <MenuItem value="in">Con stock</MenuItem>
          <MenuItem value="out">Sin stock</MenuItem>
        </TextField>

        <TextField
          label="Precio mínimo"
          type="number"
          size="small"
          className="w-40"
          value={priceMin}
          onChange={(e) => setPriceMin(e.target.value)}
        />
        <TextField
          label="Precio máximo"
          type="number"
          size="small"
          className="w-40"
          value={priceMax}
          onChange={(e) => setPriceMax(e.target.value)}
        />
      </Box>

      {/* TABLA */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#e1eaff" }}>
              <TableCell sx={{ fontWeight: "bold" }}>Nombre</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Categoria</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Precio</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Stock</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Activo</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Creado</TableCell>
              <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Acciones</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loadingProducts ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : paginatedProducts.length > 0 ? (
              paginatedProducts.map(p => (
                <TableRow key={p.id} hover>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.category}</TableCell>
                  <TableCell>S/ {p.price}</TableCell>
                  <TableCell>{p.stock}</TableCell>
                  <TableCell>
                     <Chip
                      label={ p.stock > 0  ? "DISPONIBLE" : "NO DISPONIBLE"}
                      color={ p.stock > 0  ? "success" : "error"}
                      size="small"
                    />
                    {/* <span
                      className={`px-2 py-1 rounded text-white text-sm ${p.stock > 0 ? "bg-green-500" : "bg-red-500"
                        }`}
                    >
                      {p.stock > 0 ? "Disponible" : "No disponible"}
                    </span> */}

                  </TableCell>
                  <TableCell>{p.createdAt ? p.createdAt.toLocaleDateString() : "-"}</TableCell>
                  <TableCell align="center">
                    <Box className="flex flex-wrap gap-3 mb-4 justify-center">
                      <Button variant="contained" size="small" onClick={() => onEdit(p)}
                        startIcon={<EditIcon />}

                      >Editar</Button>
                      <Button variant="contained" size="small" color="info"
                        startIcon={<QrCode2Icon />} onClick={() => onQr(p)}
                      >QR</Button>
                      <Button variant="contained" size="small" onClick={() => onDelete(p)} color="error"
                        startIcon={<EditIcon />}

                      >Eliminar</Button>


                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No se encontraron productos
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filteredProducts.length}
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

export default ProductTable;


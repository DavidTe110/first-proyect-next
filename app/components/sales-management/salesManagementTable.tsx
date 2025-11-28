"use client";

import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, TablePagination, Chip
} from "@mui/material";
import { useState } from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";

interface Props {
  sales: any[];
  loading: boolean;
  onViewDetail: (saleId: string) => void;
}

const SalesManagementTable = ({
  sales,
  loading,
  onViewDetail
}: Props) => {

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (_: any, newPage: number) => setPage(newPage);
  const handleChangeRows = (e: any) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  return (
    <Paper sx={{ width: "100%" }}>
      <TableContainer>
        <Table>
          <TableHead className="bg-blue-100">
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Creador</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Total</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Fecha</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Estado</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Acciones</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {sales.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No hay ventas registradas
                </TableCell>
              </TableRow>
            )}

            {sales
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>{sale.createdByEmail}</TableCell>

                  <TableCell>S/ {sale.totalAmount?.toFixed(2)}</TableCell>

                  <TableCell>
                    {sale.createdAt
                      ? sale.createdAt.toDate().toLocaleDateString("es-PE")
                      : "---"}
                  </TableCell>


                  {/* ESTADO */}
                  <TableCell>
                    <Chip
                      label={sale.cancelled ? "ANULADO" : "COMPLETADO"}
                      color={sale.cancelled ? "error" : "success"}
                      size="small"
                    />
                  </TableCell>

                  <TableCell>
                    <Button
                      variant="contained"
                      onClick={() => onViewDetail(sale.id)}
                      startIcon={<VisibilityIcon />}
                    >
                      Detalle
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={sales.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRows}
      />
    </Paper>
  );
};

export default SalesManagementTable;

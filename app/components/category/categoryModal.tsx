"use client";

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    CircularProgress,
} from "@mui/material";
import { useState, useEffect } from "react";

export interface Category {
  id?: string;
  name: string;
  createdAt: Date | null;
  active: boolean;
}

interface Props {
    open: boolean;
    onClose: () => void;
    onEdit: (category: Category) => void;
    loading: boolean;
    editCategory:Category|null;
}

const CategoriesModal = ({
    open,
    onClose,
    onEdit,
    editCategory,
    loading,
}: Props) => {

    const [categoryName, setCategoryName] = useState<string>("");

    // 🟦 Limpiar input cuando abres el modal
    useEffect(() => {
        if (editCategory) {
            setCategoryName(editCategory.name);
        }else{
           setCategoryName("");

        }
    }, [editCategory]);

    const handleSubmit = (e: any) => {
        e.preventDefault();

        const category : Category={
            id: editCategory?.id,
            name:categoryName,
            createdAt: new Date,
            active: true
        }
        onEdit(category)
        // onSaveCategory(categoryName.trim());
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth>
            <DialogTitle>Agregar nueva categoría</DialogTitle>

            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <TextField
                        label="Nombre de categoría"
                        fullWidth
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        autoFocus
                        className="mt-2"
                    />
                </DialogContent>

                <DialogActions>
                    <Button onClick={onClose}>Cancelar</Button>

                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={22} /> : "Guardar"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default CategoriesModal;

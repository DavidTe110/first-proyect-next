
"use client";

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    MenuItem,
    Box,
    FormControlLabel,
    Switch,
    CircularProgress
} from "@mui/material";
import { useEffect, useState } from "react";

interface User {
    id?: string;
    email: string;
    password?: string;       // solo al crear
    role: "Empleado" | "Admin";
    status: boolean;
    name:string;
    active:boolean
}

interface Props {
    open: boolean;
    onClose: () => void;
    editingUser: User | null;
    onSave: (data: User) => void;
    loading: boolean;
}

const UserModal = ({ open, onClose, editingUser, onSave, loading }: Props) => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [role, setRole] = useState<"Empleado" | "Admin">("Empleado");
    const [status, setStatus] = useState<boolean>(true);
    const [name, setName] = useState<string>("");

    useEffect(() => {
        if (editingUser) {
            setEmail(editingUser.email);
            setRole(editingUser.role);
            setStatus(editingUser.status);
            setName(editingUser.name)
            setPassword("");
        } else {
            setEmail("");
            setPassword("");
            setRole("Empleado");
            setStatus(true);
        }
    }, [editingUser]);

    useEffect(() => {
        if (!loading) {
            setEmail("");
            setPassword("");
            setRole("Empleado");
            setStatus(true);
        }
    }, [loading]);

    const handleSave = (e: any) => {
        e.preventDefault();
        const data: User = {
            id: editingUser?.id,
            email,
            role,
            status,
            name,
            active:true
        };

        // Si es usuario nuevo, agregar password
        if (!editingUser) {
            data.password = password;
        }
        console.log(data)
        onSave(data);
    };

return (
    <Dialog open={open} onClose={onClose} fullWidth>
        <DialogTitle>{editingUser ? "Editar Usuario" : "Agregar Usuario"}</DialogTitle>
        <form onSubmit={handleSave}>
            <DialogContent className="space-y-4 mt-3">

                {/* NOMBRE */}
                <TextField
                    label="Nombre"
                    fullWidth
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    margin="normal"
                />

                {/* EMAIL */}
                <TextField
                    label="Email"
                    fullWidth
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    margin="normal"
                />

                {/* PASSWORD SOLO AL CREAR */}
                {!editingUser && (
                    <TextField
                        label="Password"
                        type="password"
                        fullWidth
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        margin="normal"
                    />
                )}

                {/* ROL */}
                <TextField
                    select
                    label="Rol"
                    fullWidth
                    value={role}
                    onChange={(e) =>
                        setRole(e.target.value as "Empleado" | "Admin")
                    }
                    margin="normal"
                >
                    <MenuItem value="Empleado">Empleado</MenuItem>
                    <MenuItem value="Admin">Admin</MenuItem>
                </TextField>

                {/* STATUS SOLO EN EDICIÓN */}
                {editingUser && (
                    <FormControlLabel
                        control={
                            <Switch
                                checked={status}
                                onChange={(e) => setStatus(e.target.checked)}
                            />
                        }
                        label={status ? "Activo" : "Inactivo"}
                    />
                )}
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>

                <Button
                    variant="contained"
                    type="submit"
                    color="primary"
                    disabled={loading}
                >
                    {loading ? <CircularProgress size={24} /> : "Guardar"}
                </Button>
            </DialogActions>
        </form>
    </Dialog>
);

};

export default UserModal;

"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useStore } from "@/contexts/store-context";
import { apiClient } from "@/lib/api";
import {
  Settings,
  Store,
  User,
  Trash2,
  Loader2,
  AlertTriangle,
} from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const { selectedStore, clearSelectedStore } = useStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const handleDeleteStore = async () => {
    if (!selectedStore || !user || deleteConfirmText !== selectedStore.name) return;

    setIsDeleting(true);
    try {
      await apiClient.deleteStore(selectedStore.id, user.id);
      clearSelectedStore();
      window.location.href = "/stores";
    } catch (error) {
      console.error("Error deleting store:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Configuracion</h1>
        <p className="text-muted-foreground mt-1">
          Ajustes de tu tienda y cuenta
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Store Info */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
              <Store className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Informacion de la Tienda
              </h2>
              <p className="text-sm text-muted-foreground">
                Detalles de tu tienda actual
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Nombre de la Tienda
              </label>
              <p className="text-foreground font-medium">{selectedStore?.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                ID de la Tienda
              </label>
              <p className="text-foreground">{selectedStore?.id}</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Tu Cuenta
              </h2>
              <p className="text-sm text-muted-foreground">
                Informacion de tu perfil
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Usuario
              </label>
              <p className="text-foreground font-medium">{user?.username}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Rol
              </label>
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  user?.role === "Admin"
                    ? "bg-accent/10 text-accent"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {user?.role || "Sin rol"}
              </span>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        {user?.role === "Admin" && (
          <div className="bg-card border border-destructive/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Zona de Peligro
                </h2>
                <p className="text-sm text-muted-foreground">
                  Acciones irreversibles
                </p>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Eliminar Tienda</p>
                  <p className="text-sm text-muted-foreground">
                    Esta accion eliminara permanentemente la tienda y todos sus datos
                  </p>
                </div>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">
                  Eliminar Tienda
                </h3>
                <p className="text-sm text-muted-foreground">
                  Esta accion no se puede deshacer
                </p>
              </div>
            </div>

            <p className="text-muted-foreground mb-4">
              Escribe <span className="font-medium text-foreground">{selectedStore?.name}</span> para confirmar la eliminacion:
            </p>

            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-destructive focus:border-transparent mb-4"
              placeholder="Nombre de la tienda"
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText("");
                }}
                className="flex-1 px-4 py-3 border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteStore}
                disabled={isDeleting || deleteConfirmText !== selectedStore?.name}
                className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  "Eliminar Tienda"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

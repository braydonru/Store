"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useStore } from "@/contexts/store-context";
import { apiClient, Store } from "@/lib/api";
import { Store as StoreIcon, Plus, LogOut, Loader2, Building2, ArrowRight } from "lucide-react";

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newStoreName, setNewStoreName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const { setSelectedStore } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    const fetchStores = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        // For Admin users, show all stores. For regular users, show only their stores
        let fetchedStores: Store[];
        if (user.role === "Admin") {
          fetchedStores = await apiClient.getStores();
        } else {
          fetchedStores = await apiClient.getStoresByOwner(user.id);
        }
        setStores(fetchedStores);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar tiendas");
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && user) {
      fetchStores();
    }
  }, [isAuthenticated, user]);

  const handleSelectStore = (store: Store) => {
    setSelectedStore(store);
    router.push("/dashboard");
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsCreating(true);
    try {
      const newStore = await apiClient.createStore(newStoreName, user.id);
      setStores([...stores, newStore]);
      setShowCreateModal(false);
      setNewStoreName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear tienda");
    } finally {
      setIsCreating(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <StoreIcon className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Store Manager</h1>
              <p className="text-xs text-muted-foreground">Bienvenido, {user?.username}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-md">
              {user?.role}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Tus Tiendas</h2>
            <p className="text-muted-foreground mt-1">Selecciona una tienda para administrar</p>
          </div>
          {user?.role === "Admin" && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nueva Tienda
            </button>
          )}
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : stores.length === 0 ? (
          <div className="text-center py-20 bg-card border border-border rounded-xl">
            <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No tienes tiendas</h3>
            <p className="text-muted-foreground mb-6">
              {user?.role === "Admin" 
                ? "Crea tu primera tienda para comenzar a administrar productos"
                : "Contacta al administrador para que te asigne una tienda"}
            </p>
            {user?.role === "Admin" && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Crear Tienda
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stores.map((store) => (
              <button
                key={store.id}
                onClick={() => handleSelectStore(store)}
                className="bg-card border border-border rounded-xl p-6 text-left hover:border-accent hover:shadow-sm transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                    <Building2 className="w-6 h-6 text-muted-foreground group-hover:text-accent transition-colors" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mt-4">{store.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">ID: {store.id}</p>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Create Store Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-foreground mb-4">Nueva Tienda</h3>
            <form onSubmit={handleCreateStore}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nombre de la tienda
                </label>
                <input
                  type="text"
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="Ej: Mi Tienda Principal"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    "Crear Tienda"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

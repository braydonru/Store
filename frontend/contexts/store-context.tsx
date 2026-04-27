"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Store } from "@/lib/api";

interface StoreContextType {
  selectedStore: Store | null;
  setSelectedStore: (store: Store | null) => void;
  clearSelectedStore: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [selectedStore, setSelectedStoreState] = useState<Store | null>(null);

  useEffect(() => {
    const storedStore = localStorage.getItem("selectedStore");
    if (storedStore) {
      setSelectedStoreState(JSON.parse(storedStore));
    }
  }, []);

  const setSelectedStore = (store: Store | null) => {
    setSelectedStoreState(store);
    if (store) {
      localStorage.setItem("selectedStore", JSON.stringify(store));
    } else {
      localStorage.removeItem("selectedStore");
    }
  };

  const clearSelectedStore = () => {
    setSelectedStoreState(null);
    localStorage.removeItem("selectedStore");
  };

  return (
    <StoreContext.Provider
      value={{
        selectedStore,
        setSelectedStore,
        clearSelectedStore,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}

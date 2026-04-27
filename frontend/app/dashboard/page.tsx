"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/contexts/store-context";
import { apiClient, Product } from "@/lib/api";
import {
  Package,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Loader2,
} from "lucide-react";

interface DashboardStats {
  totalProducts: number;
  totalValue: number;
  potentialProfit: number;
  lowStockItems: number;
}

export default function DashboardPage() {
  const { selectedStore } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalValue: 0,
    potentialProfit: 0,
    lowStockItems: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedStore) return;

      try {
        setIsLoading(true);
        const fetchedProducts = await apiClient.getProducts(selectedStore.id);
        setProducts(fetchedProducts);

        // Calculate stats
        const totalProducts = fetchedProducts.length;
        const totalValue = fetchedProducts.reduce(
          (acc, p) => acc + p.price * p.stock,
          0
        );
        const potentialProfit = fetchedProducts.reduce(
          (acc, p) => acc + (p.price - p.acquisition_price) * p.stock,
          0
        );
        const lowStockItems = fetchedProducts.filter((p) => p.stock < 10).length;

        setStats({
          totalProducts,
          totalValue,
          potentialProfit,
          lowStockItems,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedStore]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Productos",
      value: stats.totalProducts.toString(),
      icon: Package,
      color: "bg-blue-500/10 text-blue-500",
    },
    {
      title: "Valor Inventario",
      value: `$${stats.totalValue.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "bg-green-500/10 text-green-500",
    },
    {
      title: "Ganancia Potencial",
      value: `$${stats.potentialProfit.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: "bg-accent/10 text-accent",
    },
    {
      title: "Stock Bajo",
      value: stats.lowStockItems.toString(),
      icon: AlertTriangle,
      color: "bg-destructive/10 text-destructive",
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Resumen de {selectedStore?.name}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            className="bg-card border border-border rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {stat.value}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Products */}
      <div className="bg-card border border-border rounded-xl">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            Productos Recientes
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Ultimos productos en tu inventario
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  Producto
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  Precio
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  Costo
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  Stock
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody>
              {products.slice(0, 5).map((product) => (
                <tr key={product.id} className="border-b border-border last:border-0">
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-foreground">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.description}
                      </p>
                    </div>
                  </td>
                  <td className="p-4 text-foreground">
                    ${product.price.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-4 text-muted-foreground">
                    ${product.acquisition_price.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-4 text-foreground">{product.stock}</td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        product.stock < 10
                          ? "bg-destructive/10 text-destructive"
                          : product.stock < 20
                          ? "bg-yellow-500/10 text-yellow-600"
                          : "bg-green-500/10 text-green-600"
                      }`}
                    >
                      {product.stock < 10
                        ? "Stock Bajo"
                        : product.stock < 20
                        ? "Stock Medio"
                        : "En Stock"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

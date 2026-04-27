const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface LoginResponse {
  access_token: string;
  username: string;
  role: string;
  id: number;
}

interface User {
  id: number;
  name: string;
  username: string;
  role: string;
}

export interface Store {
  id: number;
  name: string;
  owner: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  acquisition_price: number;
  stock: number;
  store_id?: number;
}

class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Error desconocido" }));
      throw new Error(error.detail || "Error en la solicitud");
    }

    return response.json();
  }

  // Auth
  async login(username: string, password: string): Promise<LoginResponse> {
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    const response = await fetch(`${API_BASE_URL}/security/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Error desconocido" }));
      throw new Error(error.detail || "Credenciales incorrectas");
    }

    const data = await response.json();
    this.setToken(data.access_token);
    return data;
  }

  async getProfile(): Promise<User> {
    return this.request<User>("/security/login/profile");
  }

  // Users
  async getUsers(): Promise<User[]> {
    return this.request<User[]>("/users/get_user");
  }

  async createUser(user: { name: string; username: string; password: string }) {
    return this.request("/users/create_user", {
      method: "POST",
      body: JSON.stringify(user),
    });
  }

  async setUserRole(id: number, role: string) {
    return this.request(`/users/set_role?role=${role}&id=${id}`, {
      method: "PUT",
    });
  }

  async deleteUser(id: number) {
    return this.request(`/users/delete_user?id=${id}`, {
      method: "DELETE",
    });
  }

  // Stores
  async getStores(): Promise<Store[]> {
    return this.request<Store[]>("/store/get_store");
  }

  async getStoresByOwner(ownerId: number): Promise<Store[]> {
    const stores = await this.getStores();
    return stores.filter((store) => store.owner === ownerId);
  }

  async createStore(name: string, ownerId: number): Promise<Store> {
    return this.request<Store>(`/store/create_store?owner_id=${ownerId}`, {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  }

  async deleteStore(storeId: number, ownerId: number) {
    return this.request(`/store/delete_store?store_id=${storeId}&owner_id=${ownerId}`, {
      method: "DELETE",
    });
  }

  // Products (mock for now since backend doesn't have product routes yet)
  async getProducts(storeId?: number): Promise<Product[]> {
    // This would be the actual API call when the backend supports it
    // return this.request<Product[]>(`/products/get_products?store_id=${storeId}`);
    
    // For now, return mock data
    const mockProducts: Product[] = [
      { id: 1, name: "Laptop HP", description: "Laptop HP 15.6 pulgadas", price: 899.99, acquisition_price: 650, stock: 15, store_id: storeId },
      { id: 2, name: "Mouse Logitech", description: "Mouse inalambrico", price: 29.99, acquisition_price: 15, stock: 50, store_id: storeId },
      { id: 3, name: "Teclado Mecanico", description: "Teclado RGB switches azules", price: 79.99, acquisition_price: 45, stock: 25, store_id: storeId },
      { id: 4, name: "Monitor Samsung 27\"", description: "Monitor Full HD IPS", price: 299.99, acquisition_price: 200, stock: 10, store_id: storeId },
      { id: 5, name: "Audifonos Sony", description: "Audifonos con cancelacion de ruido", price: 199.99, acquisition_price: 120, stock: 20, store_id: storeId },
    ];
    return mockProducts;
  }

  async createProduct(product: Omit<Product, "id">): Promise<Product> {
    // This would be the actual API call
    // return this.request<Product>("/products/create_product", {
    //   method: "POST",
    //   body: JSON.stringify(product),
    // });
    return { ...product, id: Math.random() * 1000 };
  }

  async updateProduct(id: number, product: Partial<Product>): Promise<Product> {
    // This would be the actual API call
    return { id, ...product } as Product;
  }

  async deleteProduct(id: number): Promise<void> {
    // This would be the actual API call
    return;
  }
}

export const apiClient = new ApiClient();

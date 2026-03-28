export interface Product {
    id: number;
    name: string;
    description?: string;
    price: number;
    category: string;
    stock: number;
    image?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface OrderItem {
    id: number;
    orderId: number;
    productId: number;
    product: Product;
    quantity: number;
    price: number;
}

export interface Order {
    id: number;
    userId: number;
    user?: {
        id: number;
        name: string;
        email: string;
    };
    totalAmount: number;
    status: string;
    items: OrderItem[];
    createdAt: string;
    updatedAt: string;
}

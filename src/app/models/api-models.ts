export type OrderStatus = 'PENDING' | 'PROCESSING' | 'READY' | 'COMPLETED' | 'REJECTED';

export interface RestaurantEntity {
  restaurantId?: string;
  restaurantName?: string;
  restaurantAddress?: string;
  isOpen?: boolean;
  table?: TableEntity[];
}

export interface TableEntity {
  tableId?: string;
  tableNumber?: number;
  seatCount?: number;
  restaurant?: RestaurantEntity;
  available?: boolean;
}

export interface TableDto extends TableEntity {}

export interface RestaurantDto extends RestaurantEntity {}

export interface CustomerEntity {
  customerID?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  orders?: OrderEntity[];
}

export interface CustomerDto extends CustomerEntity {}

export interface ItemEntity {
  itemId?: string;
  itemName?: string;
  itemDescription?: string;
  itemPrice?: string;
  isAvailable?: boolean;
  oderDetails?: OderDetailEntity[];
}

export interface ItemDto extends ItemEntity {}

export interface OrderEntity {
  orderId?: string;
  status?: OrderStatus;
  tableNumber?: number;
  createdAt?: string;
  customer?: CustomerEntity;
  oderDetails?: OderDetailEntity[];
}

export interface OrderDto extends OrderEntity {
  customer?: CustomerDto;
}

export interface OderDetailEntity {
  oderDetailId?: string;
  qty?: number;
  order?: OrderEntity;
  item?: ItemEntity;
}

export interface OderDetailDto extends OderDetailEntity {}

export interface CustomerPayload {
  name: string;
  email: string;
  phone: string;
}

export interface LineItem {
  itemId: string;
  quantity: number;
}

export interface PlaceOrderRequest {
  tableNumber?: number;
  customer: CustomerPayload;
  items: LineItem[];
}

export interface OrderLineView {
  itemId?: string;
  itemName?: string;
  qty?: number;
}

export interface OrderView {
  orderId?: string;
  tableNumber?: number;
  status?: OrderStatus;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  items?: OrderLineView[];
  createdAt?: string;
}

export interface StatusUpdateRequest {
  status: OrderStatus;
}

export interface ReviewDto {
  reviewId?: string;
  itemId?: string;
  itemName?: string;
  rating?: number | null;
  text?: string;
  category?: string;
  createdAt?: string;
}

export interface StatusMessage {
  type: 'success' | 'error';
  message: string;
}

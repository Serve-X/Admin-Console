import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CustomerDto,
  ItemDto,
  OderDetailDto,
  OrderDto,
  OrderView,
  PlaceOrderRequest,
  ReviewDto,
  StatusUpdateRequest,
  TableDto,
  RestaurantDto
} from '../models/api-models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  private url(path: string): string {
    return `${this.baseUrl}${path}`;
  }

  // Tables endpoints
  getTables(): Observable<TableDto[]> {
    return this.http.get<TableDto[]>(this.url('/api/tables'));
  }

  getTable(id: string): Observable<TableDto> {
    return this.http.get<TableDto>(this.url(`/api/tables/${id}`));
  }

  createTable(table: TableDto): Observable<TableDto> {
    return this.http.post<TableDto>(this.url('/api/tables'), table);
  }

  updateTable(id: string, table: TableDto): Observable<TableDto> {
    return this.http.put<TableDto>(this.url(`/api/tables/${id}`), table);
  }

  deleteTable(id: string): Observable<void> {
    return this.http.delete<void>(this.url(`/api/tables/${id}`));
  }

  // Restaurants endpoints
  getRestaurants(): Observable<RestaurantDto[]> {
    return this.http.get<RestaurantDto[]>(this.url('/api/restaurants'));
  }

  getRestaurant(id: string): Observable<RestaurantDto> {
    return this.http.get<RestaurantDto>(this.url(`/api/restaurants/${id}`));
  }

  createRestaurant(payload: RestaurantDto): Observable<RestaurantDto> {
    return this.http.post<RestaurantDto>(this.url('/api/restaurants'), payload);
  }

  updateRestaurant(id: string, payload: RestaurantDto): Observable<RestaurantDto> {
    return this.http.put<RestaurantDto>(this.url(`/api/restaurants/${id}`), payload);
  }

  deleteRestaurant(id: string): Observable<void> {
    return this.http.delete<void>(this.url(`/api/restaurants/${id}`));
  }

  // Orders endpoints
  getOrders(): Observable<OrderDto[]> {
    return this.http.get<OrderDto[]>(this.url('/api/orders'));
  }

  getOrder(id: string): Observable<OrderDto> {
    return this.http.get<OrderDto>(this.url(`/api/orders/${id}`));
  }

  createOrder(payload: OrderDto): Observable<OrderDto> {
    return this.http.post<OrderDto>(this.url('/api/orders'), payload);
  }

  updateOrder(id: string, payload: OrderDto): Observable<OrderDto> {
    return this.http.put<OrderDto>(this.url(`/api/orders/${id}`), payload);
  }

  deleteOrder(id: string): Observable<void> {
    return this.http.delete<void>(this.url(`/api/orders/${id}`));
  }

  // Order details endpoints
  getOrderDetails(): Observable<OderDetailDto[]> {
    return this.http.get<OderDetailDto[]>(this.url('/api/order-details'));
  }

  createOrderDetail(payload: OderDetailDto): Observable<OderDetailDto> {
    return this.http.post<OderDetailDto>(this.url('/api/order-details'), payload);
  }

  updateOrderDetail(id: string, payload: OderDetailDto): Observable<OderDetailDto> {
    return this.http.put<OderDetailDto>(this.url(`/api/order-details/${id}`), payload);
  }

  deleteOrderDetail(id: string): Observable<void> {
    return this.http.delete<void>(this.url(`/api/order-details/${id}`));
  }

  // Items endpoints
  getItems(): Observable<ItemDto[]> {
    return this.http.get<ItemDto[]>(this.url('/api/items'));
  }

  getItem(id: string): Observable<ItemDto> {
    return this.http.get<ItemDto>(this.url(`/api/items/${id}`));
  }

  createItem(payload: ItemDto): Observable<ItemDto> {
    return this.http.post<ItemDto>(this.url('/api/items'), payload);
  }

  updateItem(id: string, payload: ItemDto): Observable<ItemDto> {
    return this.http.put<ItemDto>(this.url(`/api/items/${id}`), payload);
  }

  deleteItem(id: string): Observable<void> {
    return this.http.delete<void>(this.url(`/api/items/${id}`));
  }

  // Customers endpoints
  getCustomers(): Observable<CustomerDto[]> {
    return this.http.get<CustomerDto[]>(this.url('/api/customers'));
  }

  getCustomer(id: string): Observable<CustomerDto> {
    return this.http.get<CustomerDto>(this.url(`/api/customers/${id}`));
  }

  createCustomer(payload: CustomerDto): Observable<CustomerDto> {
    return this.http.post<CustomerDto>(this.url('/api/customers'), payload);
  }

  updateCustomer(id: string, payload: CustomerDto): Observable<CustomerDto> {
    return this.http.put<CustomerDto>(this.url(`/api/customers/${id}`), payload);
  }

  deleteCustomer(id: string): Observable<void> {
    return this.http.delete<void>(this.url(`/api/customers/${id}`));
  }

  // Reviews endpoints
  getReviews(itemId?: string): Observable<ReviewDto[]> {
    let params = new HttpParams();
    if (itemId) {
      params = params.set('itemId', itemId);
    }
    return this.http.get<ReviewDto[]>(this.url('/api/reviews'), { params });
  }

  getReview(id: string): Observable<ReviewDto> {
    return this.http.get<ReviewDto>(this.url(`/api/reviews/${id}`));
  }

  deleteReview(id: string): Observable<void> {
    return this.http.delete<void>(this.url(`/api/reviews/${id}`));
  }

  // UI order endpoints
  getOrderViews(tableNumber?: number): Observable<OrderView[]> {
    let params = new HttpParams();
    if (tableNumber !== undefined && tableNumber !== null) {
      params = params.set('tableNumber', tableNumber.toString());
    }
    return this.http.get<OrderView[]>(this.url('/ui/orders'), { params });
  }

  getOrderView(orderId: string): Observable<OrderView> {
    return this.http.get<OrderView>(this.url(`/ui/orders/${orderId}`));
  }

  placeOrder(payload: PlaceOrderRequest): Observable<OrderView> {
    return this.http.post<OrderView>(this.url('/ui/orders'), payload);
  }

  updateOrderStatus(orderId: string, payload: StatusUpdateRequest): Observable<OrderView> {
    return this.http.patch<OrderView>(this.url(`/ui/orders/${orderId}/status`), payload);
  }
}

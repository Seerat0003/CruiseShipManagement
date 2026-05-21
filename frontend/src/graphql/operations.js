import { gql } from '@apollo/client';

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      message
      token
      user {
        id
        name
        email
        role
      }
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($name: String!, $email: String!, $password: String!, $phone: String) {
    register(name: $name, email: $email, password: $password, phone: $phone) {
      message
      user {
        id
        name
        email
        phone
        role
      }
    }
  }
`;

export const VOYAGER_DASHBOARD_QUERY = gql`
  query VoyagerDashboardData {
    cruises {
      id
      name
      ship_name
      departure_port
      destination
      route
      start_date
      duration_days
      total_seats
      available_seats
      price
      image_url
    }
    services {
      id
      name
      category
      price
    }
    me {
      id
      bookings {
        id
        cruise_id
        service_id
        start_time
        end_time
        status
        group_type
        passengers
        cabin_type
        rooms
        total_price
        cruise {
          id
          name
          ship_name
          departure_port
          destination
          route
          start_date
          duration_days
        }
        service {
          id
          name
          category
        }
      }
    }
  }
`;

export const SERVICE_BOOKING_DATA_QUERY = gql`
  query GetServicesAndBookings {
    services {
      id
      name
      category
      price
      capacity
    }
    bookingOccupancy {
      service_id
      start_time
      status
    }
    me {
      id
      bookings {
        id
        cruise_id
        status
        start_time
        end_time
        cruise {
          id
          name
          ship_name
          start_date
          duration_days
        }
      }
    }
  }
`;

export const CREATE_BOOKING_MUTATION = gql`
  mutation CreateBooking(
    $service_id: ID
    $cruise_id: ID
    $start_time: String!
    $end_time: String!
    $group_type: String
    $passengers: Int
    $cabin_type: String
    $rooms: Int
    $special_requests: String
  ) {
    createBooking(
      service_id: $service_id
      cruise_id: $cruise_id
      start_time: $start_time
      end_time: $end_time
      group_type: $group_type
      passengers: $passengers
      cabin_type: $cabin_type
      rooms: $rooms
      special_requests: $special_requests
    ) {
      id
      start_time
      status
      group_type
      passengers
      cabin_type
      rooms
      total_price
    }
  }
`;

export const CRUISE_BOOKING_QUERY = gql`
  query CruiseBookingData {
    cruises {
      id
      name
      ship_name
      departure_port
      destination
      route
      start_date
      duration_days
      total_seats
      available_seats
      price
      image_url
    }
    services {
      id
      name
      category
      price
    }
  }
`;

export const MANAGER_BOOKINGS_QUERY = gql`
  query ManagerBookings($category: String!) {
    bookings(category: $category) {
      id
      start_time
      end_time
      status
      user {
        id
        name
      }
      service {
        id
        name
        category
      }
    }
  }
`;

export const ADMIN_DASHBOARD_QUERY = gql`
  query AdminDashboardData {
    bookings {
      id
      start_time
      status
      group_type
      passengers
      cabin_type
      rooms
      total_price
      user {
        id
        name
        email
      }
      service {
        id
        name
        category
      }
      cruise {
        id
        name
        ship_name
        departure_port
        destination
        route
        start_date
      }
    }
    voyagers {
      id
      name
      email
      role
      createdAt
    }
    facilityStats {
      id
      name
      category
      total_bookings
      confirmed
      pending
    }
    cruises {
      id
      name
      ship_name
      departure_port
      destination
      route
      start_date
      duration_days
      total_seats
      available_seats
      price
      image_url
    }
    adminStats {
      users
      cruises
      services
      bookings
      totalSeats
      bookedSeats
      availableSeats
    }
  }
`;

export const UPDATE_BOOKING_STATUS_MUTATION = gql`
  mutation UpdateBookingStatus($id: ID!, $status: String!) {
    updateBookingStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

export const INVENTORY_PRODUCTS_QUERY = gql`
  query InventoryProducts {
    products {
      id
      name
      category
      price
      stock
    }
  }
`;

export const PRODUCT_CATALOG_QUERY = gql`
  query ProductCatalog($category: String) {
    products(category: $category) {
      id
      name
      category
      price
      stock
    }
  }
`;

export const PLACE_ORDER_MUTATION = gql`
  mutation PlaceOrder($items: [OrderItemInput!]!) {
    placeOrder(items: $items) {
      id
      total
      created_at
      items {
        id
        product_id
        quantity
        product {
          id
          name
          category
          price
        }
      }
    }
  }
`;

export const MY_ORDERS_QUERY = gql`
  query MyOrders {
    myOrders {
      id
      total
      created_at
      items {
        id
        product_id
        quantity
        product {
          id
          name
          category
          price
        }
      }
    }
  }
`;

export const ADMIN_ORDERS_QUERY = gql`
  query AdminOrders {
    orders {
      id
      total
      created_at
      user {
        id
        name
        email
      }
      items {
        id
        product_id
        quantity
        product {
          id
          name
          category
          price
        }
      }
    }
  }
`;

export const CREATE_PRODUCT_MUTATION = gql`
  mutation CreateProduct($name: String!, $category: String!, $price: Float!, $stock: Int!) {
    createProduct(name: $name, category: $category, price: $price, stock: $stock) {
      id
      name
      category
      price
      stock
    }
  }
`;

export const UPDATE_PRODUCT_MUTATION = gql`
  mutation UpdateProduct($id: ID!, $name: String, $category: String, $price: Float, $stock: Int) {
    updateProduct(id: $id, name: $name, category: $category, price: $price, stock: $stock) {
      id
      name
      category
      price
      stock
    }
  }
`;

export const DELETE_PRODUCT_MUTATION = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id)
  }
`;

export const CREATE_CRUISE_MUTATION = gql`
  mutation CreateCruise(
    $name: String!
    $ship_name: String
    $departure_port: String
    $destination: String
    $route: String
    $start_date: String
    $duration_days: Int
    $total_seats: Int
    $price: Float
    $image_url: String
  ) {
    createCruise(
      name: $name
      ship_name: $ship_name
      departure_port: $departure_port
      destination: $destination
      route: $route
      start_date: $start_date
      duration_days: $duration_days
      total_seats: $total_seats
      price: $price
      image_url: $image_url
    ) {
      id
      name
      ship_name
      departure_port
      destination
    }
  }
`;

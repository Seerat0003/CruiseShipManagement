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
  mutation Register($name: String!, $email: String!, $password: String!, $phone: String, $role: String) {
    register(name: $name, email: $email, password: $password, phone: $phone, role: $role) {
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
        start_time
        status
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
    bookings {
      id
      service_id
      start_time
      status
    }
  }
`;

export const CREATE_BOOKING_MUTATION = gql`
  mutation CreateBooking($service_id: ID!, $start_time: String!, $end_time: String!) {
    createBooking(service_id: $service_id, start_time: $start_time, end_time: $end_time) {
      id
      start_time
      status
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
      user {
        id
        name
      }
      service {
        id
        name
        category
      }
      cruise {
        id
        name
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
    $route: String
    $start_date: String
    $duration_days: Int
    $total_seats: Int
    $price: Float
    $image_url: String
  ) {
    createCruise(
      name: $name
      route: $route
      start_date: $start_date
      duration_days: $duration_days
      total_seats: $total_seats
      price: $price
      image_url: $image_url
    ) {
      id
      name
    }
  }
`;

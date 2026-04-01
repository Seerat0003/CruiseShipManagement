const gql = require("graphql-tag");

const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    name: String
    phone: String
    role: String
    createdAt: String
    voyager: Voyager
    bookings: [Booking]
    orders: [Order]
  }

  type Voyager {
    id: ID!
    user_id: ID!
    passport_number: String
    room_number: String
    user: User
  }

  type Product {
    id: ID!
    name: String!
    category: String!
    price: Float
    stock: Int
  }

  type Service {
    id: ID!
    name: String!
    category: String!
    price: Float
    capacity: Int
    bookings: [Booking]
  }

  type Cruise {
    id: ID!
    name: String!
    route: String
    start_date: String
    duration_days: Int
    total_seats: Int
    available_seats: Int
    price: Float
    image_url: String
    bookings: [Booking]
  }

  type Booking {
    id: ID!
    user_id: ID!
    service_id: ID
    cruise_id: ID
    start_time: String
    end_time: String
    status: String
    user: User
    service: Service
    cruise: Cruise
  }

  type Order {
    id: ID!
    user_id: ID!
    total: Float
    created_at: String
    user: User
    items: [OrderItem]
  }

  type OrderItem {
    id: ID!
    order_id: ID!
    product_id: ID!
    quantity: Int!
    product: Product
  }

  type AuthPayload {
    message: String!
    token: String
    user: User
  }

  type DashboardStats {
    users: Int!
    cruises: Int!
    services: Int!
    bookings: Int!
    totalSeats: Int!
    bookedSeats: Int!
    availableSeats: Int!
  }

  type FacilityStat {
    id: ID!
    name: String!
    category: String!
    total_bookings: Int!
    confirmed: Int!
    pending: Int!
  }

  input OrderItemInput {
    product_id: ID!
    quantity: Int!
  }

  type Query {
    users: [User]
    voyagers: [User]
    user(id: ID!): User
    me: User

    services(category: String): [Service]
    service(id: ID!): Service

    products(category: String): [Product]
    product(id: ID!): Product
    productsByCategory(category: String!): [Product]

    bookings(category: String, mine: Boolean): [Booking]
    booking(id: ID!): Booking

    cruises: [Cruise]
    cruise(id: ID!): Cruise

    adminStats: DashboardStats
    facilityStats: [FacilityStat]

    orders: [Order]
    order(id: ID!): Order
    myOrders: [Order]
  }

  type Mutation {
    register(
      name: String!
      email: String!
      password: String!
      phone: String
      role: String
    ): AuthPayload
    login(email: String!, password: String!): AuthPayload

    createBooking(
      service_id: ID
      cruise_id: ID
      start_time: String!
      end_time: String!
    ): Booking
    updateBookingStatus(id: ID!, status: String!): Booking
    cancelBooking(id: ID!): Booking

    placeOrder(items: [OrderItemInput!]!): Order

    createCruise(
      name: String!
      route: String
      start_date: String
      duration_days: Int
      total_seats: Int
      price: Float
      image_url: String
    ): Cruise
    updateCruise(
      id: ID!
      name: String
      price: Float
      route: String
      start_date: String
      duration_days: Int
      total_seats: Int
      available_seats: Int
      image_url: String
    ): Cruise
    deleteCruise(id: ID!): Boolean

    createProduct(
      name: String!
      category: String!
      price: Float!
      stock: Int!
    ): Product
    updateProduct(
      id: ID!
      name: String
      category: String
      price: Float
      stock: Int
    ): Product
    updateProductStock(id: ID!, stock: Int!): Product
    deleteProduct(id: ID!): Boolean

    updateService(id: ID!, name: String, category: String, price: Float): Service
    deleteService(id: ID!): Boolean

    updateMyProfile(name: String, email: String): User
  }
`;

module.exports = typeDefs;

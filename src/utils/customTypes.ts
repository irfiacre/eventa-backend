export interface EventCustomType {
  id: string;
  title?: string;
  description?: string;
  date?: Date | string;
  price?: number;
  capacity?: Date | string;
  thumbnail?: string;
  location?: string;
  createdAt?: Date | string;
  userId: string;
  user?: UserCustomType;
  bookings?: BookingCustomType;
}

export interface UserCustomType {
  id: string;
  firstName: string;
  lastName: string;
  email: Date | string;
  password: Date;
  role: string;
  createdAt: Date;
  events?: EventCustomType;
  bookings?: BookingCustomType;
}

export interface BookingCustomType {
  id: string;
  eventId: string;
  userId: string;
  events: EventCustomType;
  user: UserCustomType;
  createdAt: Date;
}

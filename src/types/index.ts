export interface User {
  id: number;
  email: string;
  name: string;
  role: "STUDENT" | "TRAINER" | "ADMIN" | "USER";
}

export interface GymClass {
  id: number;
  name: string;
  description: string;
  trainerId: number;
  trainer: User;
  schedule: string;
  capacity: number;
  bookings: any[];
}

export interface Trainer {
  id: number;
  name: string;
  email: string;
  specialization?: string;
  classes?: GymClass[];
}

export interface Membership {
  id: number;
  type: string;
  price: number;
  durationInMonths: number;
  startDate: string;
  endDate: string;
  status: string;
}

export type Role = "USER" | "TRAINER" | "ADMIN";

export interface User {
  id: number;
  email: string;
  name: string;
  role: Role;
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
  userId: number;
  startDate: string;
  endDate: string;
  planTier: string;
  billingCycle: string;
  status: string;
  price: number;
  dailyClassLimit: number;
  monthlyClassLimit: number;
}

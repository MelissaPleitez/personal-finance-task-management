import type { User } from "./user.types";

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export enum TaskCategory {
  WORK = 'work',
  PERSONAL = 'personal',
  FINANCE = 'finance',
  STUDY = 'study',
  FREELANCER = 'freelancer',
  GYM = 'gym',
}

export interface Task {
    id: number,
    title: string,
    description: string | null,
    coverPic: string | null,
    status: TaskStatus,
    priority: TaskPriority,
    category: TaskCategory,
    createdAt: Date,
    updatedAt: Date,
    user: User
}

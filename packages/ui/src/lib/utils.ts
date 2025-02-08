import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { milliseconds, type Duration } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function staleTime(duration: Duration) : number {
  return milliseconds(duration);
}
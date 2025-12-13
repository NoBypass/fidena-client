import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const possibleStyles = {
  red: "bg-red-500/50 border-red-500",
  orange: "bg-orange-500/50 border-orange-500",
  amber: "bg-amber-500/50 border-amber-500",
  yellow: "bg-yellow-500/50 border-yellow-500",
  lime: "bg-lime-500/50 border-lime-500",
  green: "bg-green-500/50 border-green-500",
  emerald: "bg-emerald-500/50 border-emerald-500",
  teal: "bg-teal-500/50 border-teal-500",
  cyan: "bg-cyan-500/50 border-cyan-500",
  sky: "bg-sky-500/50 border-sky-500",
  blue: "bg-blue-500/50 border-blue-500",
  indigo: "bg-indigo-500/50 border-indigo-500",
  violet: "bg-violet-500/50 border-violet-500",
  purple: "bg-purple-500/50 border-purple-500",
  fuchsia: "bg-fuchsia-500/50 border-fuchsia-500",
  pink: "bg-pink-500/50 border-pink-500",
  rose: "bg-rose-500/50 border-rose-500",
  slate: "bg-slate-500/50 border-slate-500",
  neutral: "bg-neutral-500/50 border-neutral-500",
}

export type Color = keyof typeof possibleStyles

export const styleKeys = Object.keys(possibleStyles) as Array<Color>

export type APIError = {
  error: string
}

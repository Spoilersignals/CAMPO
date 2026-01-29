import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  studentId: z.string().min(3, "Student ID is required"),
  schoolName: z.string().min(2, "School name is required"),
  terms: z.literal(true, { message: "You must accept the terms" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const listingSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  condition: z.enum(["New", "Used"]),
  usageDuration: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  deliveryMethod: z.enum(["Pickup", "Delivery", "Both"]),
  pickupLocation: z.string().optional(),
}).refine((data) => {
  if (data.condition === "Used" && !data.usageDuration) {
    return false;
  }
  return true;
}, {
  message: "Please specify how long you have used this item",
  path: ["usageDuration"],
});

export const commissionPaymentSchema = z.object({
  listingId: z.string().min(1, "Listing ID is required"),
});

export const messageSchema = z.object({
  content: z
    .string()
    .min(1, "Message cannot be empty")
    .max(1000, "Message must be less than 1000 characters"),
  receiverId: z.string(),
  listingId: z.string().optional(),
});

export const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  avatar: z.string().url().optional(),
});

export const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z
    .string()
    .min(10, "Review must be at least 10 characters")
    .max(500, "Review must be less than 500 characters"),
});

export const guestChatSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Phone number is required"),
  email: z.string().email("Valid email is required").optional(),
  message: z.string().min(1, "Message is required"),
});

export const itemSuggestionSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  budget: z.number().positive().optional(),
  categoryId: z.string().min(1, "Category is required"),
  condition: z.enum(["New", "Used", "Any"]).optional(),
  guestName: z.string().min(2).optional(),
  guestEmail: z.string().email().optional(),
});

export const escrowPaymentSchema = z.object({
  listingId: z.string().min(1),
  buyerName: z.string().min(2, "Name is required"),
  buyerPhone: z.string().min(10, "Phone number is required"),
  buyerEmail: z.string().email("Valid email is required"),
  amount: z.number().positive(),
});

export const supportTicketSchema = z.object({
  subject: z.string().min(3, "Subject is required"),
  description: z.string().min(10, "Please describe your issue"),
  threadId: z.string().optional(),
  buyerName: z.string().min(2).optional(),
  buyerPhone: z.string().min(10).optional(),
  buyerEmail: z.string().email().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ListingInput = z.infer<typeof listingSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type GuestChatInput = z.infer<typeof guestChatSchema>;
export type ItemSuggestionInput = z.infer<typeof itemSuggestionSchema>;
export type EscrowPaymentInput = z.infer<typeof escrowPaymentSchema>;
export type SupportTicketInput = z.infer<typeof supportTicketSchema>;

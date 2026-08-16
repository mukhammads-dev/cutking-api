import { ObjectId } from "mongoose";
import { BookingStatus } from "../enums/booking.enum";

// Burak OrderItem → CutKing BookingItem
export interface BookingItem {
    _id: ObjectId;
    itemQuantity: number;
    itemPrice: number;
    bookingId: ObjectId;   // ← orderId o'rniga
    serviceId: ObjectId;   // ← productId o'rniga
    createdAt: Date;
    updatedAt: Date;
}

// Burak Order → CutKing Booking
export interface Booking {
    _id: ObjectId;
    bookingTotal: number;
    bookingStatus: BookingStatus;
    bookingDate: Date;    // ← YANGI: qaysi kun
    bookingTime: string;  // ← YANGI: "14:00"
    memberId: ObjectId;
    masterId: ObjectId; // ← YANGI: qaysi usta
    bookingNote?: string;
    createdAt: Date;
    updatedAt: Date;
}

// Burak OrderItemInput → CutKing BookingItemInput
export interface BookingItemInput {
    itemQuantity: number;
    itemPrice: number;
    serviceId: ObjectId;  // ← productId o'rniga
    bookingId?: ObjectId;
    bookingDate: Date;      // ← YANGI
    bookingTime: string;    // ← YANGI
    masterId: ObjectId;  // ← YANGI
}
import mongoose, { Schema } from "mongoose";
import { BookingStatus } from "../libs/enums/booking.enum";

const bookingSchema = new Schema(
    {
        bookingTotal: {
            type: Number,
            required: true,
        },

        bookingStatus: {
            type: String,
            enum: BookingStatus,
            default: BookingStatus.PAUSE,
            // PENDING → CONFIRMED → COMPLETED → CANCELLED
        },

        bookingDate: {
            type: Date,
            required: true,
            // qaysi kuni
        },

        bookingTime: {
            type: String,
            required: true,
            // "14:00" — qaysi soatda
        },

        memberId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "Member",
            // kim bron qildi
        },

        masterId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "Member",
            // qaysi usta
        },

        bookingNote: {
            type: String,
            // qo'shimcha izoh
        },
    },
    { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
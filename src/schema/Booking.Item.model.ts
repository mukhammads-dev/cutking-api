import mongoose, { Schema } from "mongoose";

const bookingItemSchema = new Schema(
    {
        itemQuantity: {
            type: Number,
            required: true,
            default: 1,
            // odatda 1 ta xizmat
        },

        itemPrice: {
            type: Number,
            required: true,
            // xizmat narxi
        },

        bookingId: {
            type: Schema.Types.ObjectId,
            ref: "Booking",
            // qaysi bron ga tegishli
        },

        serviceId: {
            type: Schema.Types.ObjectId,
            ref: "Service",
            // qaysi xizmat
        },
    },
    { timestamps: true, collection: "bookingItems" }
);

export default mongoose.model("BookingItem", bookingItemSchema);
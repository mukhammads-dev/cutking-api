import mongoose, { Schema } from "mongoose";
import { ServiceCollection, ServiceStatus } from "../libs/enums/service.enum";

const serviceSchema = new Schema(
    {
        serviceStatus: {
            type: String,
            enum: ServiceStatus,
            default: ServiceStatus.PROCESS,  // ← yangi service PROCESS bo'ladi
        },
        serviceCollection: {
            type: String,
            enum: ServiceCollection,
            required: true,
        },

        serviceName: {
            type: String,
            required: true,
        },

        servicePrice: {
            type: Number,
            required: true,
        },

        serviceDuration: {
            type: Number,   // minutlarda: 30, 45, 60, 90
            required: true,
        },

        serviceDesc: {
            type: String,
            required: true,
        },

        serviceImages: {
            type: [String],
            default: []
        },

        serviceViews: {
            type: Number,
            default: 0,

        },

    },
    { timestamps: true }
);

export default mongoose.model("Service", serviceSchema);
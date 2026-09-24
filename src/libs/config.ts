export const MORGAN_FORMAT = `:method :url  - :response-time [:status] \n`;

export const AUTH_TIMER = 24;

// HTTPS (SSL) o'rnatilgandan keyin COOKIE_SECURE=true qo'ying
export const COOKIE_SECURE = process.env.COOKIE_SECURE === "true";

// Frontend va backend alohida domenda bo'lsa (cross-site) COOKIE_SAMESITE=none qo'ying.
// "none" faqat HTTPS (secure) bilan ishlaydi.
const sameSite = (process.env.COOKIE_SAMESITE as "lax" | "strict" | "none") || "lax";

export const COOKIE_OPTIONS = {
    // Frontend hozircha cookie mavjudligini JS orqali tekshiradi, shuning uchun httpOnly: false.
    httpOnly: false,
    sameSite,
    secure: COOKIE_SECURE || sameSite === "none",
};

import mongoose from "mongoose";
export const shapeIntoMongooseObjectId = (target: any) => {
    return typeof target === 'string' ? new mongoose.Types.ObjectId(target) : target;
}
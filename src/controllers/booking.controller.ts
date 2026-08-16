import { ExtendedRequest } from "../libs/types/member";
import { T } from "../libs/types/common";
import { Response } from "express";
import Errors, { HttpCode } from "../libs/Errors";
import BookingService from "../models/Booking.service";

const bookingService = new BookingService();
const bookingController: T = {};

bookingController.createBooking = async (req: ExtendedRequest, res: Response) => {
    try {
        console.log("createBooking");
        const result = await bookingService.createBooking(req.member, req.body);
        res.status(HttpCode.CREATED).json(result);
    } catch (err) {
        console.log("Error, createBooking:", err);
        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standard.code).json(Errors.standard);
    }
};

bookingController.getMyBookings = async (req: ExtendedRequest, res: Response) => {
    try {
        console.log("getMyBookings");
        const { page, limit, bookingStatus } = req.query;
        const result = await bookingService.getMyBookings(req.member, {
            page: Number(page),
            limit: Number(limit),
            bookingStatus: bookingStatus as any,
        });
        res.status(HttpCode.OK).json(result);
    } catch (err) {
        console.log("Error, getMyBookings:", err);
        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standard.code).json(Errors.standard);
    }
};

bookingController.updateBooking = async (req: ExtendedRequest, res: Response) => {
    try {
        console.log("updateBooking");
        const result = await bookingService.updateBooking(req.member, req.body);
        res.status(HttpCode.OK).json(result);
    } catch (err) {
        console.log("Error, updateBooking:", err);
        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standard.code).json(Errors.standard);
    }
};

export default bookingController;
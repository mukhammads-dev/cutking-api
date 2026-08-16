import BookingModel from "../schema/Booking.model";
import BookingItemModel from "../schema/Booking.Item.model";
import { Member } from "../libs/types/member";
import { Booking, BookingItemInput } from "../libs/types/booking";
import { shapeIntoMongooseObjectId } from "../libs/config";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { ObjectId } from "mongoose";
import { BookingStatus } from "../libs/enums/booking.enum";

class BookingService {
    private readonly bookingModel;
    private readonly bookingItemModel;

    constructor() {
        this.bookingModel = BookingModel;
        this.bookingItemModel = BookingItemModel;
    }

    public async createBooking(
        member: Member,
        input: BookingItemInput[]
    ): Promise<Booking> {
        const memberId = shapeIntoMongooseObjectId(member._id);

        const amount = input.reduce(
            (accumulator: number, item: BookingItemInput) => {
                return accumulator + item.itemPrice * item.itemQuantity;
            }, 0
        );

        try {
            const newBooking = await this.bookingModel.create({
                bookingTotal: amount,
                bookingDate: input[0].bookingDate,
                bookingTime: input[0].bookingTime,
                masterId: shapeIntoMongooseObjectId(input[0].masterId),
                memberId: memberId,
                bookingStatus: BookingStatus.PAUSE,
            });

            const bookingId = newBooking._id as unknown as ObjectId;

            await this.recordBookingItem(bookingId, input);

            return newBooking as unknown as Booking;
        } catch (err) {
            console.log("Error, model:createBooking:", err);
            throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
        }
    }

    private async recordBookingItem(
        bookingId: ObjectId,
        input: BookingItemInput[]
    ): Promise<void> {
        const promisedList = input.map(async (item: BookingItemInput) => {
            item.bookingId = bookingId;
            item.serviceId = shapeIntoMongooseObjectId(item.serviceId);

            await this.bookingItemModel.create(item);
            return "INSERTED";
        });

        const bookingItemState = await Promise.all(promisedList);
        console.log("bookingItemState:", bookingItemState);
    }

    public async getMyBookings(
        member: Member,
        input: { page: number; limit: number; bookingStatus: BookingStatus }
    ): Promise<Booking[]> {
        const memberId = shapeIntoMongooseObjectId(member._id);

        const result = await this.bookingModel
            .aggregate([
                {
                    $match: {
                        memberId: memberId,
                        bookingStatus: input.bookingStatus,
                    }
                },
                { $sort: { updatedAt: -1 } },
                { $skip: (input.page - 1) * input.limit },
                { $limit: input.limit },
                {
                    $lookup: {
                        from: "bookingItems",
                        localField: "_id",
                        foreignField: "bookingId",
                        as: "bookingItems",
                    }
                },
                {
                    $lookup: {
                        from: "services",
                        localField: "bookingItems.serviceId",
                        foreignField: "_id",
                        as: "serviceData",
                    }
                },
            ])
            .exec();

        return result;
    }

    public async updateBooking(
        member: Member,
        input: { bookingId: ObjectId; bookingStatus: BookingStatus }
    ): Promise<Booking> {
        const memberId = shapeIntoMongooseObjectId(member._id);
        const bookingId = shapeIntoMongooseObjectId(input.bookingId);

        const result = await this.bookingModel
            .findOneAndUpdate(
                {
                    memberId: memberId,
                    _id: bookingId,
                },
                { bookingStatus: input.bookingStatus },
                { new: true }
            )
            .exec();

        if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
        return result as unknown as Booking;
    }
}

export default BookingService;
import Errors, { HttpCode, Message } from "../libs/Errors";
import { ServceInput, Service, ServiceInquiry, ServiceUpdateInput } from "../libs/types/service";
import ServiceModel from "../schema/Service.model";
import { shapeIntoMongooseObjectId } from "../libs/config";
import { T } from "../libs/types/common";
import { ServiceStatus } from "../libs/enums/service.enum";
import { ObjectId } from "mongoose";
import { ViewInput } from "../libs/types/view";
import { ViewGroup } from "../libs/enums/view.enum";
import ViewService from "./View.service";

class CuttingService {
    private readonly serviceModel;
    private readonly viewService: ViewService;


    constructor() {
        this.serviceModel = ServiceModel;
        this.viewService = new ViewService();
    }
    /** SPA=========== */


    public async getServices(inquiry: ServiceInquiry): Promise<Service[]> {
        const match: T = { serviceStatus: ServiceStatus.PROCESS };

        if (inquiry.serviceCollection)
            match.serviceCollection = inquiry.serviceCollection;

        if (inquiry.search) {
            match.serviceName = { $regex: new RegExp(inquiry.search, "i") };
        }

        const sort: T =
            inquiry.booking === "servicePrice"
                ? { [inquiry.booking]: 1 } // prise: eng arzonidan yuqoriga
                : { [inquiry.booking]: -1 }; // created at: eng ohirgi qoshilgandan pastga qarab

        const result = await this.serviceModel
            .aggregate([
                { $match: match },
                { $sort: sort },
                { $skip: (inquiry.page * 1 - 1) * inquiry.limit }, // skip qil limitga qarab
                { $limit: inquiry.limit * 1 },  // skipdan keyingi page olib ber
            ])
            .exec();

        if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

        return result as unknown as Service[];
    }

    public async getService(
        memberId: ObjectId | null,
        id: string
    ): Promise<any> {
        const serviceId = shapeIntoMongooseObjectId(id);

        let result = await this.serviceModel
            .findOne({
                _id: serviceId,
                serviceStatus: ServiceStatus.PROCESS,
            })
            .exec();

        if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

        if (memberId) {
            // Check Existence
            const input: ViewInput = {
                memberId: memberId,
                viewRefId: serviceId,
                viewGroup: ViewGroup.SERVICE,
            };

            const existView = await this.viewService.checkViewExistence(input);

            console.log("exist:", !!existView);

            if (!existView) {
                // Insert View
                await this.viewService.insertMemberView(input);

                // Increase Counts
                result = await this.serviceModel
                    .findByIdAndUpdate(
                        serviceId,
                        { $inc: { serviceViews: +1 } },
                        { new: true }
                    )
                    .exec();
            }
        }

        return result as unknown as Service;
    }

    /** BSSR============ */

    public async getAllServices(): Promise<Service[]> { // array ichida bir qator productlarni qaytarishi kerak
        const result = await this.serviceModel.find().exec();
        if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND)

        return result.map(doc => doc.toJSON()) as unknown as Service[];

    }

    public async createNewService(input: ServceInput): Promise<Service> {
        try {
            const result = await this.serviceModel.create(input);

            return result.toJSON() as unknown as Service;

        } catch (err) {
            console.error("Error, model:createNewService:", err)
            throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
        }
    }

    public async updateChosenService(
        id: string,
        input: ServiceUpdateInput
    ): Promise<Service> {
        id = shapeIntoMongooseObjectId(id);  // string => ObjectId
        const result = await this.serviceModel.
            findOneAndUpdate({ _id: id }, input, { new: true }) // update bolgan malumotni qaytaradi
            .exec();
        if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED)

        return result.toJSON() as unknown as Service;

    }

}


export default CuttingService

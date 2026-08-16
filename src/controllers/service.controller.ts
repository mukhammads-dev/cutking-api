import express, { Request, Response } from "express";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { T } from "../libs/types/common";
import CuttingService from "../models/Cutting.service";
import { AdminRequest, ExtendedRequest } from "../libs/types/member";
import { ServceInput, ServiceInquiry } from "../libs/types/service";
import { ServiceCollection } from "../libs/enums/service.enum";


const cuttingService = new CuttingService();

const serviceController: T = {};

/** SPA=========== */

serviceController.getServices = async (req: Request, res: Response) => {
    try {
        console.log("getServices");

        const { page, limit, booking, serviceCollection, search } = req.query;

        const inquiry: ServiceInquiry = { // object yaratish
            booking: String(booking), // "createdAt" — qaysi fieldga qarab tartiblash
            page: Number(page),    // 1 — nechinchi sahifa
            limit: Number(limit),  // 8 — bir sahifada nechta
        };

        if (serviceCollection) {
            // productCollection kelsa → FOOD, DRINK, DESSERT...
            // kelmasa → hammasi (filter yo'q)
            inquiry.serviceCollection = serviceCollection as ServiceCollection;
        }

        if (search) inquiry.search = String(search);
        // search kelsa → "lavash" bilan qidiradi
        // kelmasa → qidiruv yo'q

        const result = await cuttingService.getServices(inquiry);

        res.status(HttpCode.OK).json(result);
    } catch (err) {
        console.log("Error, getServices:", err);

        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standard.code).json(Errors.standard);
    }
};

serviceController.getService = async (req: ExtendedRequest, res: Response) => {
    try {
        console.log("getService");

        const { id } = req.params;

        const memberId = req.member?._id ?? null,
            // cast memberId to any to satisfy expected mongoose Schema.Types.ObjectId param
            result = await cuttingService.getService(memberId as any, String(id));

        res.status(HttpCode.OK).json(result);
    } catch (err) {
        console.log("Error, getService:", err);

        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standard.code).json(Errors.standard);
    }
};




/** BSSR============ */

serviceController.getAllServices = async (req: AdminRequest, res: Response) => {
    try {
        console.log('getAllServices')
        const data = await cuttingService.getAllServices();

        res.render("services", {
            services: data,
            member: (req as AdminRequest).member
        });
    }
    catch (err) {
        console.log("Error, getAllServices:", err)
        if (err instanceof Errors) res.status(err.code).json(err)
        else res.status(Errors.standard.code).json(Errors.standard);
    }
};

serviceController.getServiceCreate = (req: AdminRequest, res: Response) => {
    try {
        res.render("service-create", { member: req.session.member });
    } catch (err) {
        console.log(err);
    }
};

serviceController.createNewService = async (req: AdminRequest, res: Response) => {
    try {
        console.log('createNewService')

        if (!req.files?.length) // file 1 dan kop bolishi kerak bolmasa error
            throw new Errors(HttpCode.INTERNAL_SERVER_ERROR, Message.CREATE_FAILED)

        const data: ServceInput = req.body

        data.serviceImages = req.files?.map(ele => {
            return ele.path.replace(/\\/g, "/");
        })

        await cuttingService.createNewService(data)

        res.send(
            `<script>alert ("${"Successfull creation"}"); window.location.replace('/admin/services/all') </script>`);
    }
    catch (err) {
        console.log("Error, createNewService:", err)
        const message =
            err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG;
        res.send(
            `<script>alert ("${message}"); window.location.replace('/admin/services/all') </script>`);
    }
};

serviceController.updateChosenService = async (req: Request, res: Response) => {
    try {
        console.log('updateChosenService')
        const id = req.params.id as string;

        const result = await cuttingService.updateChosenService(id, req.body);

        res.status(HttpCode.OK).json({ data: result })
    }
    catch (err) {
        console.log("Error, updateChosenService:", err)
        if (err instanceof Errors) res.status(err.code).json(err)
        else res.status(Errors.standard.code).json(Errors.standard);
    }
};

export default serviceController
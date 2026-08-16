import { ObjectId } from "mongoose"
import { ServiceCollection, ServiceStatus } from "../enums/service.enum";

export interface Service {
    _id: ObjectId;
    serviceStatus: ServiceStatus;
    serviceCollection: ServiceCollection;
    serviceName: string;
    servicePrice: number;
    serviceDuration: number;
    serviceDesc?: string;
    serviceImages: string[];
    serviceViews: number;
    createdAt: Date;
    updatedAt: Date
}


export interface ServiceInquiry {
    booking: string;
    page: number;
    limit: number;
    serviceCollection?: ServiceCollection;
    search?: string;
}



export interface ServceInput {
    serviceStatus?: ServiceStatus;
    serviceCollection: ServiceCollection;
    serviceName: string;
    servicePrice: number;
    serviceDuration: number;
    serviceDesc?: string;
    serviceImages?: string[];
    serviceViews?: number;
}


export interface ServiceUpdateInput {
    _id: ObjectId;
    serviceStatus?: ServiceStatus;
    serviceCollection?: ServiceCollection;
    serviceName?: string;
    servicePrice?: number;
    serviceDuration?: number;
    serviceDesc?: string;
    serviceImages?: string[];
    productViews?: number;
}
import { NextFunction, Request, Response } from "express";
import { sendSuccess } from "../../common/response/apiResponse";
import { CustomerService } from "./customer.service";

export class CustomerController {
  constructor(private readonly customerService = new CustomerService()) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      return sendSuccess(res, "Customer created", await this.customerService.create(req.user!.businessId, req.body), 201);
    } catch (error) {
      return next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      return sendSuccess(res, "Customers fetched", await this.customerService.list(req.user!.businessId, req.query));
    } catch (error) {
      return next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      return sendSuccess(res, "Customer fetched", await this.customerService.getById(req.user!.businessId, req.params.id as string));
    } catch (error) {
      return next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      return sendSuccess(res, "Customer updated", await this.customerService.update(req.user!.businessId, req.params.id as string, req.body));
    } catch (error) {
      return next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.customerService.delete(req.user!.businessId, req.params.id as string);
      return sendSuccess(res, "Customer deleted", null);
    } catch (error) {
      return next(error);
    }
  };
}

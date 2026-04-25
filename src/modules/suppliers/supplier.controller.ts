import { NextFunction, Request, Response } from "express";
import { sendSuccess } from "../../common/response/apiResponse";
import { SupplierService } from "./supplier.service";

export class SupplierController {
  constructor(private readonly supplierService = new SupplierService()) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      return sendSuccess(res, "Supplier created", await this.supplierService.create(req.user!.businessId, req.body), 201);
    } catch (error) {
      return next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      return sendSuccess(res, "Suppliers fetched", await this.supplierService.list(req.user!.businessId, req.query));
    } catch (error) {
      return next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      return sendSuccess(res, "Supplier fetched", await this.supplierService.getById(req.user!.businessId, req.params.id as string));
    } catch (error) {
      return next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      return sendSuccess(res, "Supplier updated", await this.supplierService.update(req.user!.businessId, req.params.id as string, req.body));
    } catch (error) {
      return next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.supplierService.delete(req.user!.businessId, req.params.id as string);
      return sendSuccess(res, "Supplier deleted", null);
    } catch (error) {
      return next(error);
    }
  };
}

import { NextFunction, Request, Response } from "express";
import { sendSuccess } from "../common/response/apiResponse";
import { InventoryService } from "../services/inventory.service";

export class InventoryController {
  constructor(private readonly inventoryService = new InventoryService()) {}

  createTransaction = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const transaction = await this.inventoryService.createTransaction(req.user!.businessId, req.body);
      return sendSuccess(res, "Inventory transaction created", transaction, 201);
    } catch (error) {
      return next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const transactions = await this.inventoryService.list(req.user!.businessId, req.query);
      return sendSuccess(res, "Inventory transactions fetched", transactions);
    } catch (error) {
      return next(error);
    }
  };
}

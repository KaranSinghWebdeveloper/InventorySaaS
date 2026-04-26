import { NextFunction, Request, Response } from "express";
import { sendSuccess } from "../common/response/apiResponse";
import { PurchaseService } from "../services/purchase.service";

export class PurchaseController {
  constructor(private readonly purchaseService = new PurchaseService()) { }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      return sendSuccess(res, "Purchase created", await this.purchaseService.create(req.user!.businessId, req.body), 201);
    } catch (error) {
      return next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      return sendSuccess(res, "Purchases fetched", await this.purchaseService.list(req.user!.businessId, req.query));
    } catch (error) {
      return next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      return sendSuccess(
        res,
        "Purchase fetched",
        await this.purchaseService.getById(req.user!.businessId, Number(req.params.id))
      );
    } catch (error) {
      return next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      return sendSuccess(
        res,
        "Purchase updated",
        await this.purchaseService.update(req.user!.businessId, Number(req.params.id), req.body)
      );
    } catch (error) {
      return next(error);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      return sendSuccess(
        res,
        "Purchase status updated",
        await this.purchaseService.updateStatus(req.user!.businessId, Number(req.params.id), req.body)
      );
    } catch (error) {
      return next(error);
    }
  };

  downloadPdf = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const purchaseId = Number(req.params.id);
      const businessId = req.user!.businessId;

      const purchase = await this.purchaseService.getById(businessId, purchaseId);

      if (!purchase) {
        return res.status(404).json({ message: "Purchase not found" });
      }

      const pdfBuffer = await this.purchaseService.generatePurchasePdf(purchase);

      // 🔥 Important headers for download
      res.writeHead(200, {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=purchase_order_${purchaseId}.pdf`,
        "Content-Length": pdfBuffer.length,
      });

      return res.end(pdfBuffer);

    } catch (error) {
      return next(error);
    }
  };
}

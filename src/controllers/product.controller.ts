import { NextFunction, Request, Response } from "express";
import { sendSuccess } from "../common/response/apiResponse";
import { ProductService } from "../services/product.service";

export class ProductController {
  constructor(private readonly productService = new ProductService()) { }

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await this.productService.create(req.user!.businessId, req.body);
      return sendSuccess(res, "Product created", product, 201);
    } catch (error) {
      return next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const products = await this.productService.list(req.user!.businessId, req.query);
      return sendSuccess(res, "Products fetched", products);
    } catch (error) {
      return next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await this.productService.getById(req.user!.businessId, Number(req.params.id));
      return sendSuccess(res, "Product fetched", product);
    } catch (error) {
      return next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await this.productService.update(req.user!.businessId, Number(req.params.id), req.body);
      return sendSuccess(res, "Product updated", product);
    } catch (error) {
      return next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.productService.delete(req.user!.businessId, Number(req.params.id));
      return sendSuccess(res, "Product deleted", null);
    } catch (error) {
      return next(error);
    }
  };
}

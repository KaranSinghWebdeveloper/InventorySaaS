import { NextFunction, Request, Response } from "express";
import { sendSuccess } from "../common/response/apiResponse";
import { CategoryService } from "../services/category.service";

export class CategoryController {
  constructor(private readonly categoryService = new CategoryService()) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = await this.categoryService.create(req.user!.businessId, req.body);
      return sendSuccess(res, "Category created", category, 201);
    } catch (error) {
      return next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const categories = await this.categoryService.list(req.user!.businessId, req.query);
      return sendSuccess(res, "Categories fetched", categories);
    } catch (error) {
      return next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = await this.categoryService.getById(req.user!.businessId, Number(req.params.id));
      return sendSuccess(res, "Category fetched", category);
    } catch (error) {
      return next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = await this.categoryService.update(req.user!.businessId, Number(req.params.id), req.body);
      return sendSuccess(res, "Category updated", category);
    } catch (error) {
      return next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.categoryService.delete(req.user!.businessId, Number(req.params.id));
      return sendSuccess(res, "Category deleted", null);
    } catch (error) {
      return next(error);
    }
  };
}

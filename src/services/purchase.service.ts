import { PurchaseStatus } from "@prisma/client";
import { BadRequestError, NotFoundError } from "../common/errors/httpErrors";
import { buildPaginationMeta, getPagination } from "../utils/pagination";
import {
  allowedPurchaseTransitions,
  getNextPurchaseNumber,
  isPurchaseLocked
} from "../utils/purchase";
import { PurchaseRepository } from "../repositories/purchase.repository";
import { purchaseResource } from "../resources/purchase.resource";
import {
  CreatePurchaseInput,
  UpdatePurchaseInput,
  UpdatePurchaseStatusInput
} from "../requests/purchase.request";
import { MailService } from "./mail.service";

export class PurchaseService {
  constructor(
    private readonly purchaseRepository = new PurchaseRepository(),
    private readonly mailService = new MailService()
  ) { }

  async create(businessId: number, input: CreatePurchaseInput) {
    const totalAmount = input.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const status = input.status ?? PurchaseStatus.SAVE_DRAFT;

    return purchaseResource(
      await this.purchaseRepository.create(businessId, input, {
        totalAmount,
        purchaseNumber: input.purchaseNumber ?? getNextPurchaseNumber(),
        status
      })
    );
  }

  async list(
    businessId: number,
    query: { page?: number; limit?: number; status?: PurchaseStatus; supplierId?: number; search?: string }
  ) {
    const pagination = getPagination(query);
    // Ensure status is valid, not empty
    let validStatus: PurchaseStatus | undefined = undefined;
    if (query.status) {
      const statusStr = String(query.status).trim();
      if (statusStr && statusStr.length > 0 && Object.values(PurchaseStatus).includes(statusStr as PurchaseStatus)) {
        validStatus = query.status;
      }
    }

    const { items, total } = await this.purchaseRepository.findMany({
      businessId,
      skip: pagination.skip,
      take: pagination.take,
      status: validStatus,
      supplierId: query.supplierId,
      search: query.search
    });
    return { items: items.map(purchaseResource), meta: buildPaginationMeta(total, pagination.page, pagination.limit) };
  }

  async getById(businessId: number, id: number) {
    const purchase = await this.purchaseRepository.findById(businessId, id);

    if (!purchase) {
      throw new NotFoundError("Purchase not found");
    }

    return purchaseResource(purchase);
  }

  async update(businessId: number, id: number, input: UpdatePurchaseInput) {
    const purchase = await this.purchaseRepository.findById(businessId, id);

    if (!purchase) {
      throw new NotFoundError("Purchase not found");
    }

    if (isPurchaseLocked(purchase.status)) {
      throw new BadRequestError("Received or verified purchases cannot be edited");
    }

    const totalAmount = input.items
      ? input.items.reduce((sum, item) => sum + item.quantity * item.price, 0)
      : purchase.totalAmount === null
        ? 0
        : Number(purchase.totalAmount);

    return purchaseResource(await this.purchaseRepository.update(businessId, id, input, totalAmount));
  }

  async updateStatus(businessId: number, id: number, input: UpdatePurchaseStatusInput) {
    const purchase = await this.purchaseRepository.findById(businessId, id);

    if (!purchase) {
      throw new NotFoundError("Purchase not found");
    }

    if (purchase.status === input.status) {
      throw new BadRequestError("Purchase is already in the requested status");
    }

    const allowedTransitions = allowedPurchaseTransitions[purchase.status];

    if (!allowedTransitions.includes(input.status)) {
      throw new BadRequestError(
        `Invalid purchase status transition from ${purchase.status} to ${input.status}`
      );
    }

    if (input.status === PurchaseStatus.SENT && !purchase.supplier?.email) {
      throw new BadRequestError("Supplier email is required to send purchase order");
    }

    const updatedPurchase = purchaseResource(
      await this.purchaseRepository.updateStatus(businessId, purchase, input)
    );

    if (input.status === PurchaseStatus.SENT) {
      await this.sendPurchaseOrderEmail(updatedPurchase);
    }

    return updatedPurchase;
  }

  private async sendPurchaseOrderEmail(purchase: any) {
    const pdf = await this.generatePurchasePdf(purchase);
    const supplierName = purchase.supplier?.name || "Supplier";
    const businessName = purchase.business?.name || "our company";

    await this.mailService.sendMail({
      to: purchase.supplier.email,
      subject: `Purchase Order ${purchase.purchaseNumber}`,
      text: [
        `Hello ${supplierName},`,
        "",
        `Please find attached purchase order ${purchase.purchaseNumber} from ${businessName}.`,
        "",
        "Thank you."
      ].join("\n"),
      attachments: [
        {
          filename: `purchase_order_${purchase.purchaseNumber || purchase.id}.pdf`,
          content: pdf,
          contentType: "application/pdf"
        }
      ]
    });
  }

  async generatePurchasePdf(purchase: any) {
    const PDFDocument = require("pdfkit");
    const doc = new PDFDocument({ margin: 30, size: "A4" });
    const buffers: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => buffers.push(chunk));

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const left = doc.page.margins.left;
    const right = pageWidth - doc.page.margins.right;
    const contentWidth = right - left;
    const formatDate = (value?: string | Date | null) => {
      if (!value) return "-";
      return new Date(value).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit"
      });
    };
    const formatCurrency = (value?: number | string | null) =>
      `$ ${Number(value || 0).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;
    const drawDivider = (y: number) => {
      doc
        .strokeColor("#dddddd")
        .lineWidth(1)
        .moveTo(left, y)
        .lineTo(right, y)
        .stroke();
    };
    const drawLogo = () => {
      const x = right - 118;
      const y = 88;

      doc.rect(x + 48, y - 1, 14, 14).fill("#10b981");
      doc.rect(x + 62, y - 1, 14, 14).fill("#ef4444");
      doc.rect(x + 55, y + 12, 24, 14).fill("#3b82f6");
      doc
        .fillColor("#4b4b4b")
        .font("Helvetica-Bold")
        .fontSize(28)
        .text("Logo", x, y + 24, { width: 110, align: "center" });
    };
    const drawTableHeader = (y: number) => {
      doc.rect(left, y, contentWidth, 20).fill("#d9d9d9");
      doc.fillColor("#111111").font("Helvetica-Bold").fontSize(9);
      doc.text("Sl.", left + 8, y + 5, { width: 24 });
      doc.text("Description", left + 36, y + 5, { width: 250 });
      doc.text("Qty", left + 306, y + 5, { width: 45, align: "right" });
      doc.text("Rate", left + 374, y + 5, { width: 70, align: "right" });
      doc.text("Amount", left + 456, y + 5, { width: 70, align: "right" });
      return y + 20;
    };

    doc.rect(8, 8, pageWidth - 16, pageHeight - 16).strokeColor("#bdbdbd").lineWidth(1).stroke();

    doc
      .fillColor("#000000")
      .font("Helvetica-Bold")
      .fontSize(24)
      .text("PURCHASE ORDER", left, 28, { width: contentWidth, align: "center" });

    const business = purchase.business || {};
    doc.fontSize(11).text(business.name || "Business", left, 82, { width: 250 });
    doc.font("Helvetica").fontSize(9);
    const businessLines = [
      business.address,
      business.phone ? `Mobile: ${business.phone}` : null,
      business.email ? `Email: ${business.email}` : null
    ].filter(Boolean);
    businessLines.forEach((line) => doc.text(String(line), { width: 270 }));
    drawLogo();

    drawDivider(168);

    const supplier = purchase.supplier || {};
    doc.font("Helvetica-Bold").fontSize(11).fillColor("#000000").text("Supplier", left, 178);
    doc.font("Helvetica").fontSize(9);
    [
      supplier.name || "-",
      supplier.address,
      supplier.phone ? `Phone: ${supplier.phone}` : null,
      supplier.email ? `Email: ${supplier.email}` : null
    ]
      .filter(Boolean)
      .forEach((line) => doc.text(String(line), { width: 240 }));

    doc.font("Helvetica-Bold").fontSize(10).text("PO No :", right - 180, 178, { width: 70 });
    doc.text(purchase.purchaseNumber || "-", right - 86, 178, { width: 86, align: "right" });
    doc.font("Helvetica").fontSize(9).text("Date :", right - 180, 202, { width: 70 });
    doc.text(formatDate(purchase.purchaseDate || purchase.createdAt), right - 86, 202, { width: 86, align: "right" });
    doc.text("Status :", right - 180, 218, { width: 70 });
    doc.text(String(purchase.status || "-").replace(/_/g, " "), right - 86, 218, { width: 86, align: "right" });

    let y = drawTableHeader(254);
    const items = purchase.items?.length ? purchase.items : [];

    if (!items.length) {
      doc.font("Helvetica").fontSize(9).fillColor("#333333");
      doc.text("No items", left + 36, y + 7, { width: 250 });
      drawDivider(y + 24);
      y += 24;
    }

    items.forEach((item: any, index: number) => {
      const rate = Number(item.price || 0);
      const amount = item.total === null || item.total === undefined ? item.quantity * rate : Number(item.total);
      const description = item.productName || item.name || "Item";
      const rowHeight = Math.max(22, doc.heightOfString(description, { width: 250 }) + 10);

      if (y + rowHeight > pageHeight - 170) {
        doc.addPage();
        doc.rect(8, 8, pageWidth - 16, pageHeight - 16).strokeColor("#bdbdbd").lineWidth(1).stroke();
        y = drawTableHeader(40);
      }

      doc.fillColor("#111111").font("Helvetica").fontSize(9);
      doc.text(String(index + 1), left + 8, y + 6, { width: 24, align: "center" });
      doc.text(description, left + 36, y + 6, { width: 250 });
      doc.text(String(item.quantity || 0), left + 306, y + 6, { width: 45, align: "right" });
      doc.text(formatCurrency(rate), left + 374, y + 6, { width: 70, align: "right" });
      doc.text(formatCurrency(amount), left + 456, y + 6, { width: 70, align: "right" });
      drawDivider(y + rowHeight);
      y += rowHeight;
    });

    y += 18;
    const totalAmount = Number(purchase.totalAmount || items.reduce((sum: number, item: any) => sum + Number(item.total || item.quantity * item.price || 0), 0));
    const summaryX = right - 235;
    const amountX = right - 90;

    doc.font("Helvetica-Bold").fontSize(10).fillColor("#000000").text("Payment Instructions", left, y);
    doc.font("Helvetica").fontSize(9).text(purchase.terms || "Please process payment as agreed.", left, y + 18, {
      width: 220
    });
    if (purchase.notes) {
      doc.text(purchase.notes, left, y + 46, { width: 220 });
    }

    drawDivider(y + 20);
    doc.font("Helvetica-Bold").fontSize(9).text("Subtotal", summaryX, y, { width: 120, align: "right" });
    doc.text(formatCurrency(totalAmount), amountX, y, { width: 90, align: "right" });
    doc.text("Total", summaryX, y + 30, { width: 120, align: "right" });
    doc.text(formatCurrency(totalAmount), amountX, y + 30, { width: 90, align: "right" });
    doc.font("Helvetica").text("Paid", summaryX, y + 46, { width: 120, align: "right" });
    doc.text(formatCurrency(0), amountX, y + 46, { width: 90, align: "right" });
    doc.font("Helvetica-Bold").text("Balance Due", summaryX, y + 62, { width: 120, align: "right" });
    doc.text(formatCurrency(totalAmount), amountX, y + 62, { width: 90, align: "right" });
    drawDivider(y + 84);

    const signatureY = Math.min(y + 116, pageHeight - 110);
    doc
      .font("Helvetica-Oblique")
      .fontSize(24)
      .text("Signature", right - 170, signatureY, { width: 130, align: "center" });
    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .text("Authorized Signatory", right - 180, signatureY + 38, { width: 150, align: "center" });

    doc.end();

    return new Promise<Buffer>((resolve, reject) => {
      doc.on("end", () => {
        resolve(Buffer.concat(buffers));
      });
      doc.on("error", reject);
    });
  }
}

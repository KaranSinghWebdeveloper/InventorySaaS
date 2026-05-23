import net from "node:net";
import tls from "node:tls";
import { randomUUID } from "node:crypto";
import { env } from "../config/env";
import { BadRequestError } from "../common/errors/httpErrors";

type MailAttachment = {
  filename: string;
  content: Buffer;
  contentType: string;
};

type SendMailInput = {
  to: string;
  subject: string;
  text: string;
  attachments?: MailAttachment[];
};

export class MailService {
  async sendMail(input: SendMailInput) {
    this.ensureConfigured();

    const host = env.SMTP_HOST!;
    const port = env.SMTP_PORT;
    let socket: net.Socket | tls.TLSSocket = env.SMTP_SECURE
      ? tls.connect({ host, port, servername: host })
      : net.connect({ host, port });

    const reader = this.createReader(socket);

    await reader.expect(220);
    await this.command(socket, reader, `EHLO ${this.localHostname()}`, 250);

    if (!env.SMTP_SECURE) {
      socket.write("STARTTLS\r\n");
      await reader.expect(220);
      socket = tls.connect({ socket, servername: host });
      reader.bind(socket);
      await this.command(socket, reader, `EHLO ${this.localHostname()}`, 250);
    }

    if (env.SMTP_USER && env.SMTP_PASS) {
      await this.command(socket, reader, `AUTH PLAIN ${Buffer.from(`\0${env.SMTP_USER}\0${env.SMTP_PASS}`).toString("base64")}`, 235);
    }

    const from = env.MAIL_FROM || env.SMTP_USER!;
    const fromAddress = this.extractEmail(from);

    await this.command(socket, reader, `MAIL FROM:<${fromAddress}>`, 250);
    await this.command(socket, reader, `RCPT TO:<${input.to}>`, [250, 251]);
    await this.command(socket, reader, "DATA", 354);

    socket.write(`${this.buildMessage({ ...input, from })}\r\n.\r\n`);
    await reader.expect(250);
    await this.command(socket, reader, "QUIT", 221);
    socket.end();
  }

  private ensureConfigured() {
    if (!env.SMTP_HOST || (!env.MAIL_FROM && !env.SMTP_USER)) {
      throw new BadRequestError("SMTP email configuration is missing");
    }
  }

  private async command(
    socket: net.Socket | tls.TLSSocket,
    reader: ReturnType<MailService["createReader"]>,
    command: string,
    expectedCode: number | number[]
  ) {
    socket.write(`${command}\r\n`);
    await reader.expect(expectedCode);
  }

  private createReader(initialSocket: net.Socket | tls.TLSSocket) {
    let socket = initialSocket;
    let buffer = "";
    const pending: Array<{
      expectedCode: number | number[];
      resolve: () => void;
      reject: (error: Error) => void;
    }> = [];

    const onData = (chunk: Buffer) => {
      buffer += chunk.toString("utf8");
      this.flushSmtpResponses(buffer, (response, remaining) => {
        buffer = remaining;
        const current = pending.shift();
        if (!current) return;

        const codes = Array.isArray(current.expectedCode) ? current.expectedCode : [current.expectedCode];
        if (codes.includes(response.code)) {
          current.resolve();
          return;
        }

        current.reject(new Error(`SMTP command failed: ${response.text}`));
      });
    };

    const bind = (nextSocket: net.Socket | tls.TLSSocket) => {
      socket.removeListener("data", onData);
      socket = nextSocket;
      socket.on("data", onData);
      socket.on("error", (error) => {
        pending.splice(0).forEach((request) => request.reject(error));
      });
    };

    bind(socket);

    return {
      bind,
      expect: (expectedCode: number | number[]) =>
        new Promise<void>((resolve, reject) => {
          pending.push({ expectedCode, resolve, reject });
          onData(Buffer.alloc(0));
        })
    };
  }

  private flushSmtpResponses(
    buffer: string,
    callback: (response: { code: number; text: string }, remaining: string) => void
  ) {
    let remaining = buffer;

    while (remaining.includes("\r\n")) {
      const lines = remaining.split("\r\n");
      let consumed = 0;
      let completeLine = -1;

      for (let index = 0; index < lines.length - 1; index += 1) {
        const line = lines[index] || "";
        consumed += line.length + 2;
        if (/^\d{3} /.test(line)) {
          completeLine = index;
          break;
        }
      }

      if (completeLine === -1) break;

      const responseLines = lines.slice(0, completeLine + 1);
      const lastLine = responseLines[responseLines.length - 1] || "";
      const code = Number(lastLine.slice(0, 3));
      remaining = remaining.slice(consumed);
      callback({ code, text: responseLines.join("\n") }, remaining);
    }
  }

  private buildMessage(input: SendMailInput & { from: string }) {
    const boundary = `boundary-${randomUUID()}`;
    const headers = [
      `From: ${this.cleanHeader(input.from)}`,
      `To: ${this.cleanHeader(input.to)}`,
      `Subject: ${this.cleanHeader(input.subject)}`,
      "MIME-Version: 1.0",
      `Content-Type: multipart/mixed; boundary="${boundary}"`
    ];

    const parts = [
      `--${boundary}`,
      "Content-Type: text/plain; charset=utf-8",
      "Content-Transfer-Encoding: 7bit",
      "",
      input.text
    ];

    input.attachments?.forEach((attachment) => {
      parts.push(
        `--${boundary}`,
        `Content-Type: ${attachment.contentType}; name="${this.cleanHeader(attachment.filename)}"`,
        "Content-Transfer-Encoding: base64",
        `Content-Disposition: attachment; filename="${this.cleanHeader(attachment.filename)}"`,
        "",
        this.wrapBase64(attachment.content)
      );
    });

    parts.push(`--${boundary}--`);

    return [...headers, "", ...parts]
      .join("\r\n")
      .replace(/^\./gm, "..");
  }

  private extractEmail(value: string) {
    const match = value.match(/<([^>]+)>/);
    return (match?.[1] || value).trim();
  }

  private cleanHeader(value: string) {
    return value.replace(/[\r\n]/g, " ").trim();
  }

  private wrapBase64(content: Buffer) {
    return content.toString("base64").match(/.{1,76}/g)?.join("\r\n") || "";
  }

  private localHostname() {
    return "localhost";
  }
}

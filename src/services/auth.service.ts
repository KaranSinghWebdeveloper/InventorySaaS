import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { User } from "@prisma/client";
import { env } from "../config/env";
import { ConflictError, UnauthorizedError } from "../common/errors/httpErrors";
import { AuthRepository } from "../repositories/auth.repository";
import { LoginInput, RegisterInput } from "../requests/auth.request";
import { businessResource, userResource } from "../resources/auth.resource";

export class AuthService {
  constructor(private readonly authRepository = new AuthRepository()) { }

  async register(input: RegisterInput) {
    const existingUser = await this.authRepository.findUserByEmail(input.email);

    if (existingUser) {
      throw new ConflictError("Email is already registered");
    }

    const password = await bcrypt.hash(input.password, env.BCRYPT_SALT_ROUNDS);

    const { business, user } = await this.authRepository.createBusinessWithAdmin({
      // businessName: input.businessName ?? "Default Business",
      name: input.name,
      email: input.email,
      password
    });

    return {
      business: businessResource(business),
      user: userResource(user),
      tokens: this.issueTokens(user)
    };
  }

  async login(input: LoginInput) {
    const user = await this.authRepository.findUserByEmail(input.email);

    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const isValidPassword = await bcrypt.compare(input.password, user.password);

    if (!isValidPassword) {
      throw new UnauthorizedError("Invalid email or password");
    }

    return {
      user: userResource(user),
      tokens: this.issueTokens(user)
    };
  }

  refresh(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as {
        id: number;
        businessId: number;
        role: User["role"];
      };

      const payload = {
        id: decoded.id,
        businessId: decoded.businessId,
        role: decoded.role
      };

      return {
        accessToken: this.sign(payload, env.JWT_ACCESS_SECRET, env.JWT_ACCESS_EXPIRES_IN),
        refreshToken: this.sign(payload, env.JWT_REFRESH_SECRET, env.JWT_REFRESH_EXPIRES_IN)
      };
    } catch {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }
  }

  private issueTokens(user: User) {
    const payload = {
      id: user.id,
      businessId: user.businessId,
      role: user.role
    };

    return {
      accessToken: this.sign(payload, env.JWT_ACCESS_SECRET, env.JWT_ACCESS_EXPIRES_IN),
      refreshToken: this.sign(payload, env.JWT_REFRESH_SECRET, env.JWT_REFRESH_EXPIRES_IN)
    };
  }

  private sign(payload: object, secret: string, expiresIn: string) {
    const options: SignOptions = { expiresIn: expiresIn as SignOptions["expiresIn"] };
    return jwt.sign(payload, secret, options);
  }
}

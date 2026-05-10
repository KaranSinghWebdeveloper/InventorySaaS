import { ConflictError, NotFoundError } from "../common/errors/httpErrors";
import { UpdateProfileInput } from "../requests/user.request";
import { UserRepository } from "../repositories/user.repository";
import { userResource } from "../resources/user.resource";

export class UserService {
  constructor(private readonly userRepository = new UserRepository()) { }

  async getProfile(userId: number) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError("User not found");
    return userResource(user);
  }

  async updateProfile(userId: number, input: UpdateProfileInput) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    if (input.email && input.email !== user.email) {
      const existingUser = await this.userRepository.findByEmail(input.email);
      if (existingUser && existingUser.id !== userId) {
        throw new ConflictError("Email is already registered");
      }
    }

    return userResource(await this.userRepository.update(userId, input));
  }
}

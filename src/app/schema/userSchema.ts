import { z } from "zod";

export const userLoginSchema = z.object({
  username: z.string().min(5, { message: "Username minimal 5 karakter" }),
  password: z.string().min(6, { message: "Password minimal 6 karakter" }),
});

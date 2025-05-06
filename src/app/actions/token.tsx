"use server";
import { cookies } from "next/headers";

export default async function getCookies() {
  const cookieStore = await cookies();
  return cookieStore.get("accessToken")?.value;
}

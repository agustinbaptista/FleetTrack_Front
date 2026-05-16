import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/constants";

export default async function Home() {
  const jar = await cookies();
  const token = jar.get(AUTH_COOKIE_NAME)?.value;
  redirect(token ? "/dashboard" : "/login");
}

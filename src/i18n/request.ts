import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export const LOCALES = ["ar", "en"] as const;
export type AppLocale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: AppLocale = "ar";
export const LOCALE_COOKIE = "stmark_locale";

export async function getLocaleFromCookies(): Promise<AppLocale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  if (value === "ar" || value === "en") return value;
  return DEFAULT_LOCALE;
}

export default getRequestConfig(async () => {
  const locale = await getLocaleFromCookies();
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});

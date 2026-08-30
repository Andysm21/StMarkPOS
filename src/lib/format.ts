export function formatCurrency(amount: number, locale: string) {
  try {
    return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-EG", {
      style: "currency",
      currency: "EGP",
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} EGP`;
  }
}

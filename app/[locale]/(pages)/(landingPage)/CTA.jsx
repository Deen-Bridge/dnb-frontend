import Button from "@/components/atoms/form/Button";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function CTA() {
  const t = useTranslations("landing.cta");
  return (
    <section className="relative mx-auto py-10 px-4 sm:px-8 bg-basic text-white  shadow-xl flex flex-col items-center justify-center overflow-hidden">
      <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-center">
        {t("title")}
      </h2>
      <p className="text-lg sm:text-xl mb-8 text-center max-w-2xl">
        {t("description")}
      </p>
      <Link href="/signup">
        <Button className="px-8 py-3 text-lg font-semibold rounded-full bg-white text-green-700 hover:bg-green-100 transition">
          {t("button")}
        </Button>
      </Link>
    </section>
  );
}

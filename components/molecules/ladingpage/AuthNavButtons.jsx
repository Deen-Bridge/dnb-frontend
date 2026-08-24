"use client";
import { useTranslations } from "next-intl";
import Button from "../../atoms/form/Button";
import { useAuth } from "@/hooks/useAuth";
export default function AuthNavButtons() {
    const t = useTranslations("navbar.auth");
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? (
        <Button to="/dashboard/" wide round className="bg-accent hover:bg-highlight text-white px-10 py-3 animate-in-out transition-all">
            {t("dashboard")}
        </Button>
    ) : (
        <>
            <div className="flex items-center gap-5 ">
                <Button
                    wide
                    round
                    to="/login"
                    className="bg-accent hover:bg-highlight text-white px-10 py-3 animate-in-out transition-all "
                >
                    {t("login")}
                </Button>
                <Button to="/signup" wide round
                    className="bg-accent hover:bg-highlight text-white px-10 py-3 animate-in-out transition-all"    >
                    {t("signup")}
                </Button>
            </div>

        </>
    );
}

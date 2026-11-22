import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Linking, Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { subscribeUpgradeRequirement, type UpgradeRequirement } from "@/lib/update/policy";

export function UpgradeRequired({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const [upgrade, setUpgrade] = useState<UpgradeRequirement | null>(null);
  useEffect(() => subscribeUpgradeRequirement(setUpgrade), []);
  if (!upgrade) return children;
  return <View style={{ flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#092601" }}>
    <Text style={{ color: "#fff", fontSize: 24, fontWeight: "700", marginBottom: 12 }}>{t("updates.title")}</Text>
    <Text style={{ color: "#fff", marginBottom: 20 }}>{t("updates.description")}</Text>
    {upgrade.storeUrl ? <Pressable onPress={() => Linking.openURL(upgrade.storeUrl!)} style={{ backgroundColor: "#fff", padding: 14, borderRadius: 8 }}><Text style={{ color: "#092601", textAlign: "center", fontWeight: "700" }}>{t("updates.action")}</Text></Pressable> : null}
  </View>;
}

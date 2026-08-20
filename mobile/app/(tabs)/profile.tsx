import { View, Text, ScrollView, TouchableOpacity, Switch } from "react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/lib/auth";

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const [darkMode, setDarkMode] = useState(false);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ padding: 16, marginTop: 48, gap: 24 }}>
        <Text style={{ fontSize: 28, fontWeight: "bold", color: "#092601" }}>
          {t("profile.title")}
        </Text>

        <View style={{ alignItems: "center", gap: 8 }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: "#092601",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontSize: 32, fontWeight: "bold" }}>
              {user?.name?.charAt(0) || "?"}
            </Text>
          </View>
          <Text style={{ fontSize: 18, fontWeight: "600", color: "#171717" }}>
            {user?.name || "Guest"}
          </Text>
          <Text style={{ fontSize: 14, color: "#525252" }}>
            {user?.email || ""}
          </Text>
        </View>

        <View style={{ gap: 4 }}>
          {[
            { label: t("profile.purchases"), key: "purchases" },
            { label: t("profile.saved"), key: "saved" },
            { label: t("profile.wallet"), key: "wallet" },
            { label: t("profile.notifications"), key: "notifications" },
          ].map((item) => (
            <TouchableOpacity
              key={item.key}
              style={{
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: "#f5f5f5",
              }}
            >
              <Text style={{ fontSize: 16, color: "#171717" }}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 16,
          }}
        >
          <Text style={{ fontSize: 16, color: "#171717" }}>
            {t("profile.darkMode")}
          </Text>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: "#e5e5e5", true: "#3d8c2b" }}
          />
        </View>

        <TouchableOpacity
          onPress={signOut}
          style={{
            borderWidth: 1,
            borderColor: "#dc2626",
            borderRadius: 8,
            padding: 14,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#dc2626", fontSize: 16, fontWeight: "600" }}>
            {t("auth.logout")}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

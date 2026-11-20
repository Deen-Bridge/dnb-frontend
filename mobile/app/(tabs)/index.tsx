import { View, Text, ScrollView, RefreshControl } from "react-native";
import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/lib/auth";

export default function HomeScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // TODO: Fetch fresh data
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#fff" }}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={{ gap: 24, marginTop: 48 }}>
        <View style={{ gap: 4 }}>
          <Text style={{ fontSize: 14, color: "#525252" }}>
            {t("home.greeting")}
          </Text>
          <Text style={{ fontSize: 28, fontWeight: "bold", color: "#092601" }}>
            {user?.displayName || user?.name || "Guest"}
          </Text>
        </View>

        <View
          style={{
            backgroundColor: "#f5f5f5",
            borderRadius: 12,
            padding: 20,
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 16, color: "#525252" }}>
            {t("home.continueLearning")}
          </Text>
          <Text style={{ fontSize: 14, color: "#a3a3a3", marginTop: 8 }}>
            {t("common.emptyState")}
          </Text>
        </View>

        <View
          style={{
            backgroundColor: "#f5f5f5",
            borderRadius: 12,
            padding: 20,
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 16, color: "#525252" }}>
            {t("home.browseCourses")}
          </Text>
          <Text style={{ fontSize: 14, color: "#a3a3a3", marginTop: 8 }}>
            {t("common.emptyState")}
          </Text>
        </View>

        <View
          style={{
            backgroundColor: "#f5f5f5",
            borderRadius: 12,
            padding: 20,
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 16, color: "#525252" }}>
            {t("home.featuredBooks")}
          </Text>
          <Text style={{ fontSize: 14, color: "#a3a3a3", marginTop: 8 }}>
            {t("common.emptyState")}
          </Text>
        </View>

        <View
          style={{
            backgroundColor: "#f5f5f5",
            borderRadius: 12,
            padding: 20,
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 16, color: "#525252" }}>
            {t("home.liveSpaces")}
          </Text>
          <Text style={{ fontSize: 14, color: "#a3a3a3", marginTop: 8 }}>
            {t("common.emptyState")}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

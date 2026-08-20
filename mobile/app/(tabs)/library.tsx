import { View, Text, FlatList, RefreshControl } from "react-native";
import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";

export default function LibraryScreen() {
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ padding: 16, marginTop: 48 }}>
        <Text style={{ fontSize: 28, fontWeight: "bold", color: "#092601" }}>
          {t("library.title")}
        </Text>
      </View>
      <FlatList
        data={[]}
        renderItem={() => null}
        contentContainerStyle={{ padding: 16, flex: 1 }}
        ListEmptyComponent={
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingTop: 100,
            }}
          >
            <Text style={{ fontSize: 16, color: "#a3a3a3" }}>
              {t("common.emptyState")}
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}

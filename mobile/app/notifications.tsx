import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { apiClient } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/api/endpoints";

type Notification = { id: string; title?: string; message?: string; read?: boolean };

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(null); setUnauthorized(false);
    try {
      const { data } = await apiClient.get(API_ENDPOINTS.notifications.list);
      setItems(data.notifications ?? data.items ?? data ?? []);
    } catch (err: any) {
      if (err?.response?.status === 401) setUnauthorized(true);
      else setError(t("notifications.loadError"));
    } finally { setLoading(false); }
  }, [t]);

  useEffect(() => { load(); }, [load]);

  const markRead = async (notification: Notification) => {
    if (notification.read) return;
    await apiClient.put(API_ENDPOINTS.notifications.markRead(notification.id));
    setItems((current) => current.map((item) => item.id === notification.id ? { ...item, read: true } : item));
  };

  const markAllRead = async () => {
    await apiClient.put(API_ENDPOINTS.notifications.markAllRead);
    setItems((current) => current.map((item) => ({ ...item, read: true })));
  };

  return <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
      <Text accessibilityRole="header" style={{ fontSize: 28, fontWeight: "bold", color: "#092601" }}>{t("notifications.title")}</Text>
      {!loading && items.some((item) => !item.read) && <Pressable onPress={markAllRead} accessibilityRole="button"><Text style={{ color: "#166534" }}>{t("notifications.markAll")}</Text></Pressable>}
    </View>
    {loading ? <ActivityIndicator accessibilityLabel={t("common.loading")} />
      : unauthorized ? <Text accessibilityRole="alert">{t("notifications.unauthorized")}</Text>
      : error ? <View><Text accessibilityRole="alert">{error}</Text><Pressable onPress={load} accessibilityRole="button"><Text style={{ color: "#166534", marginTop: 8 }}>{t("common.retry")}</Text></Pressable></View>
      : items.length === 0 ? <Text>{t("notifications.empty")}</Text>
      : items.map((item) => <Pressable key={item.id} onPress={() => markRead(item)} accessibilityRole="button" accessibilityLabel={item.title ?? item.message}><Text style={{ fontWeight: item.read ? "400" : "700" }}>{item.title}</Text><Text>{item.message}</Text></Pressable>)}
  </ScrollView>;
}

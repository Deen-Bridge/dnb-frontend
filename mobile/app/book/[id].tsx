import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { adaptBook } from "@/lib/api/catalog";
import type { Book } from "@/types";

export default function BookDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    if (!id || Array.isArray(id)) { setError(true); setLoading(false); return; }
    setLoading(true); setError(false);
    try {
      const { data } = await apiClient.get(API_ENDPOINTS.books.byId(encodeURIComponent(id)));
      setBook(adaptBook(data?.book ?? data));
    } catch { setError(true); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { void load(); }, [load]);
  if (loading) return <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}><ActivityIndicator color="#092601" /></View>;
  if (error || !book) return <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24, gap: 16 }}><Text>{t("common.error")}</Text><TouchableOpacity onPress={load}><Text style={{ color: "#092601", fontWeight: "600" }}>{t("common.retry")}</Text></TouchableOpacity></View>;
  return <View style={{ flex: 1, padding: 20, paddingTop: 56, gap: 16, backgroundColor: "#fff" }}>
    <TouchableOpacity onPress={() => router.back()}><Text style={{ color: "#092601" }}>{t("common.back")}</Text></TouchableOpacity>
    <Text style={{ fontSize: 28, fontWeight: "700", color: "#092601" }}>{book.title}</Text>
    <Text style={{ color: "#525252" }}>{book.author}</Text>
    <Text style={{ color: "#525252", lineHeight: 22 }}>{book.description}</Text>
    <TouchableOpacity onPress={() => apiClient.get(API_ENDPOINTS.books.preview(book.id))} style={{ backgroundColor: "#092601", padding: 14, borderRadius: 8, alignItems: "center" }}><Text style={{ color: "#fff", fontWeight: "600" }}>{t("library.read")}</Text></TouchableOpacity>
  </View>;
}

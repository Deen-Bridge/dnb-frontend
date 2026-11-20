import { View, Text, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity } from "react-native";
import { useState, useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { CourseCard } from "@/components/molecules/CourseCard";
import { SearchBar } from "@/components/molecules/SearchBar";
import { EmptyState } from "@/components/molecules/EmptyState";
import { fetchCoursesPage, isCatalogOfflineError } from "@/lib/api/catalog";
import type { Course } from "@/types";

export default function CoursesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<"offline" | "error" | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [page, setPage] = useState(1);
  const categories = useMemo(() => ["all", ...new Set(courses.map((course) => course.category))], [courses]);

  const load = useCallback(async (nextPage: number, replace = false, signal?: AbortSignal) => {
    if (replace) setLoading(true); else setLoadingMore(true);
    setError(null);
    try {
      const result = await fetchCoursesPage({ page: nextPage, search, category, signal });
      setCourses((current) => {
        const merged = replace ? result.items : [...current, ...result.items];
        return [...new Map(merged.map((course) => [course.id, course])).values()];
      });
      setPage(result.page);
      setHasNextPage(result.hasNextPage && result.items.length > 0);
    } catch (cause) {
      if ((cause as Error).name !== "CanceledError") setError(isCatalogOfflineError(cause) ? "offline" : "error");
    } finally { setLoading(false); setLoadingMore(false); setRefreshing(false); }
  }, [category, search]);

  useEffect(() => { const controller = new AbortController(); void load(1, true, controller.signal); return () => controller.abort(); }, [load]);
  const onRefresh = useCallback(() => { setRefreshing(true); void load(1, true); }, [load]);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ padding: 16, marginTop: 48, gap: 16 }}>
        <Text style={{ fontSize: 28, fontWeight: "bold", color: "#092601" }}>
          {t("courses.title")}
        </Text>
        <SearchBar value={search} onChangeText={setSearch} placeholder={t("common.search")} />
        <FlatList horizontal data={categories} keyExtractor={(item) => item} showsHorizontalScrollIndicator={false} renderItem={({ item }) => <TouchableOpacity onPress={() => setCategory(item)} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, backgroundColor: category === item ? "#092601" : "#f5f5f5", marginRight: 8 }}><Text style={{ color: category === item ? "#fff" : "#525252" }}>{item}</Text></TouchableOpacity>} />
      </View>
      <FlatList
        data={courses.filter((course) => category === "all" || course.category === category)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CourseCard course={item} onPress={() => router.push({ pathname: "/course/[id]", params: { id: item.id } })} />}
        contentContainerStyle={{ padding: 16, gap: 12, flexGrow: 1 }}
        onEndReached={() => { if (hasNextPage && !loadingMore) void load(page + 1); }}
        onEndReachedThreshold={0.4}
        ListHeaderComponent={loading ? <ActivityIndicator color="#092601" /> : null}
        ListFooterComponent={loadingMore ? <ActivityIndicator color="#092601" /> : null}
        ListEmptyComponent={loading ? null : <EmptyState title={error ? (error === "offline" ? t("common.offline") : t("common.error")) : t("common.emptyState")} message={error ? t("common.retry") : undefined} />}
        ListFooterComponentStyle={{ paddingVertical: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
      {error && !loading && <TouchableOpacity onPress={onRefresh} style={{ alignSelf: "center", padding: 12 }}><Text style={{ color: "#092601", fontWeight: "600" }}>{t("common.retry")}</Text></TouchableOpacity>}
    </View>
  );
}

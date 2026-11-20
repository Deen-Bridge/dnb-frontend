import { View, Text, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity } from "react-native";
import { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { BookCard } from "@/components/molecules/BookCard";
import { SearchBar } from "@/components/molecules/SearchBar";
import { EmptyState } from "@/components/molecules/EmptyState";
import { fetchBooksPage, isCatalogOfflineError } from "@/lib/api/catalog";
import type { Book } from "@/types";

export default function LibraryScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<"offline" | "error" | null>(null);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const load = useCallback(async (nextPage: number, replace = false, signal?: AbortSignal) => {
    if (replace) setLoading(true); else setLoadingMore(true);
    setError(null);
    try {
      const result = await fetchBooksPage({ page: nextPage, search, signal });
      setBooks((current) => [...new Map((replace ? result.items : [...current, ...result.items]).map((book) => [book.id, book])).values()]);
      setPage(result.page);
      setHasNextPage(result.hasNextPage && result.items.length > 0);
    } catch (cause) {
      if ((cause as Error).name !== "CanceledError") setError(isCatalogOfflineError(cause) ? "offline" : "error");
    } finally { setLoading(false); setLoadingMore(false); setRefreshing(false); }
  }, [search]);

  useEffect(() => { const controller = new AbortController(); void load(1, true, controller.signal); return () => controller.abort(); }, [load]);
  const onRefresh = useCallback(() => { setRefreshing(true); void load(1, true); }, [load]);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ padding: 16, marginTop: 48, gap: 16 }}>
        <Text style={{ fontSize: 28, fontWeight: "bold", color: "#092601" }}>
          {t("library.title")}
        </Text>
        <SearchBar value={search} onChangeText={setSearch} placeholder={t("common.search")} />
      </View>
      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <BookCard book={item} onPress={() => router.push({ pathname: "/book/[id]", params: { id: item.id } })} />}
        contentContainerStyle={{ padding: 16, gap: 12, flexGrow: 1 }}
        onEndReached={() => { if (hasNextPage && !loadingMore) void load(page + 1); }}
        onEndReachedThreshold={0.4}
        ListHeaderComponent={loading ? <ActivityIndicator color="#092601" /> : null}
        ListFooterComponent={loadingMore ? <ActivityIndicator color="#092601" /> : null}
        ListEmptyComponent={loading ? null : <EmptyState title={error ? (error === "offline" ? t("common.offline") : t("common.error")) : t("common.emptyState")} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
      {error && !loading && <TouchableOpacity onPress={onRefresh} style={{ alignSelf: "center", padding: 12 }}><Text style={{ color: "#092601", fontWeight: "600" }}>{t("common.retry")}</Text></TouchableOpacity>}
    </View>
  );
}

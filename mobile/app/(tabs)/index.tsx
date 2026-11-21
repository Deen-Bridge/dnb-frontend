import { ActivityIndicator, FlatList, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/lib/auth";
import { EMPTY_HOME_DATA, fetchHomeData, type HomeData, type HomeSection, type HomeSectionState } from "@/lib/home";
import type { Book, Course, Space } from "@/types";

const initialStates: Record<HomeSection, HomeSectionState> = {
  continueLearning: { status: "loading" }, courses: { status: "loading" }, books: { status: "loading" }, spaces: { status: "loading" },
};

function cardTitle(item: Course | Book | Space): string { return "title" in item ? item.title : "name" in item ? item.name : ""; }
function cardSubtitle(item: Course | Book | Space): string { return "description" in item ? item.description : "author" in item ? item.author : item.mentor?.name ?? ""; }

export default function HomeScreen() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<HomeData>(EMPTY_HOME_DATA);
  const [states, setStates] = useState(initialStates);
  const [refreshing, setRefreshing] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const requestId = useRef(0);
  const activeController = useRef<AbortController | null>(null);

  const load = useCallback(async (manual = false) => {
    const id = ++requestId.current;
    activeController.current?.abort();
    const controller = new AbortController();
    activeController.current = controller;
    if (manual) setRefreshing(true);
    setStates(Object.fromEntries(Object.keys(initialStates).map((key) => [key, { status: "loading" }])) as typeof initialStates);
    try {
      const result = await fetchHomeData(isAuthenticated, controller.signal);
      if (id !== requestId.current) return;
      setData(result.data);
      setStates(Object.fromEntries(Object.keys(initialStates).map((key) => {
        const section = key as HomeSection;
        const items = result.data[section];
        return [section, { status: result.failures.includes(section) ? "error" : items.length ? "ready" : "empty" }];
      })) as typeof initialStates);
      setHasLoaded(true);
      console.info("mobile_home_sections_loaded", { failedCount: result.failures.length });
    } catch (error) {
      if (!controller.signal.aborted && id === requestId.current) {
        setStates(Object.fromEntries(Object.keys(initialStates).map((key) => [key, { status: "error", error }])) as typeof initialStates);
        console.info("mobile_home_refresh_failed");
      }
    } finally {
      if (id === requestId.current) setRefreshing(false);
    }
  }, [isAuthenticated]);

  useFocusEffect(useCallback(() => {
    void load();
    return () => {
      requestId.current += 1;
      activeController.current?.abort();
      activeController.current = null;
    };
  }, [load]));

  useEffect(() => { if (!isAuthenticated) setData((current) => ({ ...current, continueLearning: [] })); }, [isAuthenticated]);
  const sections = useMemo(() => (["continueLearning", "courses", "books", "spaces"] as HomeSection[]).filter((section) => isAuthenticated || section !== "continueLearning"), [isAuthenticated]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#fff" }}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} />}
    >
      <View style={{ gap: 24, marginTop: 48 }}>
        <View style={{ gap: 4 }}>
          <Text style={{ fontSize: 14, color: "#525252" }}>
            {t("home.greeting")}
          </Text>
          <Text style={{ fontSize: 28, fontWeight: "bold", color: "#092601" }}>
            {user?.displayName || user?.name || t("common.guest")}
          </Text>
        </View>

        {sections.map((section) => <HomeSectionView key={section} title={t(section === "continueLearning" ? "home.continueLearning" : section === "courses" ? "home.browseCourses" : section === "books" ? "home.featuredBooks" : "home.liveSpaces")} state={states[section]} items={data[section]} hasLoaded={hasLoaded} loadingLabel={t("common.loading")} errorLabel={t("common.error")} emptyLabel={t("common.emptyState")} retryLabel={t("common.retry")} onRetry={() => void load(true)} onPress={(item) => router.push((section === "courses" || section === "continueLearning" ? `/course/${item.id}` : section === "books" ? `/book/${item.id}` : `/space/${item.id}`) as never)} />)}
        {!hasLoaded && <ActivityIndicator accessibilityLabel={t("common.loading")} color="#092601" />}
      </View>
    </ScrollView>
  );
}

function HomeSectionView({ title, state, items, hasLoaded, loadingLabel, errorLabel, emptyLabel, retryLabel, onRetry, onPress }: { title: string; state: HomeSectionState; items: Array<Course | Book | Space>; hasLoaded: boolean; loadingLabel: string; errorLabel: string; emptyLabel: string; retryLabel: string; onRetry: () => void; onPress: (item: Course | Book | Space) => void }) {
  return <View style={{ gap: 12 }}>
    <Text style={{ fontSize: 20, fontWeight: "700", color: "#171717" }}>{title}</Text>
    {state.status === "loading" && !hasLoaded ? <View accessible accessibilityLabel={loadingLabel} style={{ height: 112, backgroundColor: "#f5f5f5", borderRadius: 12 }} /> : state.status === "error" ? <View style={{ backgroundColor: "#fff7ed", borderRadius: 12, padding: 16, gap: 8 }}><Text style={{ color: "#9a3412" }}>{errorLabel}</Text><Pressable accessibilityRole="button" onPress={onRetry}><Text style={{ color: "#092601", fontWeight: "700" }}>{retryLabel}</Text></Pressable></View> : state.status === "empty" ? <Text style={{ color: "#737373" }}>{emptyLabel}</Text> : <FlatList horizontal data={items} keyExtractor={(item) => item.id} showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }} renderItem={({ item }) => <Pressable accessibilityRole="button" onPress={() => onPress(item)} style={{ width: 220, minHeight: 108, backgroundColor: "#f5f5f5", borderRadius: 12, padding: 14, gap: 8 }}><Text numberOfLines={2} style={{ fontSize: 16, fontWeight: "600", color: "#171717" }}>{cardTitle(item)}</Text><Text numberOfLines={3} style={{ fontSize: 13, color: "#525252" }}>{cardSubtitle(item)}</Text></Pressable>} />}
  </View>;
}

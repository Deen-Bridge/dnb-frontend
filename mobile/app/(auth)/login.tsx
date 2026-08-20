import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useState } from "react";
import { Link } from "expo-router";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/lib/auth";

export default function LoginScreen() {
  const { t } = useTranslation();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      await signIn(email, password);
    } catch (e: any) {
      setError(e.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ gap: 24 }}>
          <View style={{ gap: 8 }}>
            <Text style={{ fontSize: 30, fontWeight: "bold", color: "#092601" }}>
              {t("auth.loginTitle")}
            </Text>
            <Text style={{ fontSize: 16, color: "#525252" }}>
              {t("auth.loginSubtitle")}
            </Text>
          </View>

          <View style={{ gap: 16 }}>
            <View style={{ gap: 6 }}>
              <Text style={{ fontSize: 14, fontWeight: "500", color: "#171717" }}>
                {t("auth.email")}
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                style={{
                  borderWidth: 1,
                  borderColor: "#e5e5e5",
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                }}
              />
            </View>

            <View style={{ gap: 6 }}>
              <Text style={{ fontSize: 14, fontWeight: "500", color: "#171717" }}>
                {t("auth.password")}
              </Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry
                autoComplete="password"
                style={{
                  borderWidth: 1,
                  borderColor: "#e5e5e5",
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                }}
              />
            </View>

            {error ? (
              <Text style={{ color: "#dc2626", fontSize: 14 }}>{error}</Text>
            ) : null}

            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoading}
              style={{
                backgroundColor: "#092601",
                borderRadius: 8,
                padding: 14,
                alignItems: "center",
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
                {isLoading ? t("common.loading") : t("auth.login")}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={{ textAlign: "center", color: "#525252" }}>
            {t("auth.noAccount")}{" "}
            <Link href="/(auth)/signup" asChild>
              <Text style={{ color: "#092601", fontWeight: "600" }}>
                {t("auth.signup")}
              </Text>
            </Link>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

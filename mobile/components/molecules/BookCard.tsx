import { Image, Text, TouchableOpacity, View } from "react-native";
import type { Book } from "@/types";

export function BookCard({ book, onPress }: { book: Book; onPress?: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} accessibilityRole="button" accessibilityLabel={book.title} style={{ flexDirection: "row", gap: 12, padding: 12, borderWidth: 1, borderColor: "#e5e5e5", borderRadius: 12, backgroundColor: "#fff" }}>
      {book.coverImage ? <Image source={{ uri: book.coverImage }} style={{ width: 84, height: 116, borderRadius: 8, backgroundColor: "#f5f5f5" }} /> : <View style={{ width: 84, height: 116, borderRadius: 8, backgroundColor: "#f5f5f5" }} />}
      <View style={{ flex: 1, gap: 6 }}>
        <Text style={{ fontSize: 16, fontWeight: "600", color: "#171717" }} numberOfLines={2}>{book.title}</Text>
        <Text style={{ fontSize: 14, color: "#525252" }} numberOfLines={1}>{book.author}</Text>
        <Text style={{ fontSize: 14, color: "#737373" }} numberOfLines={3}>{book.description || book.category}</Text>
        <Text style={{ fontSize: 14, fontWeight: "600", color: "#092601" }}>{book.isPurchased ? "Purchased" : `${book.currency} ${book.price}`}</Text>
      </View>
    </TouchableOpacity>
  );
}

import { Redirect } from "expo-router";

/** Eski /ai vb. rotalar veya bozuk deep link → ana sayfaya dön */
export default function NotFound() {
  return <Redirect href="/" />;
}

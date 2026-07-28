/**
 * AI sayfası geçici olarak kapatıldı.
 * Yedek: client/disabled/AI.tsx.bak
 * Açmak için:
 * 1) Yedeği bu dosyanın üzerine kopyala
 * 2) App.tsx import + /ai route yorumunu kaldır
 * 3) Sidebar.tsx AI menü satırının yorumunu kaldır
 */
export default function AIPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 text-gray-800">
      <div className="text-center px-6">
        <h1 className="text-xl font-bold mb-2">AI geçici olarak kapalı</h1>
        <p className="text-sm opacity-60">Daha sonra tekrar açılacak.</p>
      </div>
    </div>
  );
}

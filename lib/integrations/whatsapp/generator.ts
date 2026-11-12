import { CommunityBlueprint } from "@/lib/blueprint/types";
import { WhatsAppCommunityPackage, WhatsAppCommunityPackageSchema, WhatsAppGroupSpec } from "./types";

/**
 * Generates an actionable, copy-ready WhatsApp Community setup package
 * following official WhatsApp Community guidelines.
 */
export function generateWhatsAppCommunityPackage(
  blueprint: CommunityBlueprint
): WhatsAppCommunityPackage {
  const subGroups: WhatsAppGroupSpec[] = [];

  // Filter blueprint channels into WhatsApp group equivalents
  for (const cat of blueprint.categories) {
    for (const channel of cat.channels) {
      if (channel.name === "welcome-and-rules" || channel.name === "announcements") {
        continue; // Handled by Announcement Group
      }

      subGroups.push({
        name: `${blueprint.communityName} · ${channel.name.replace(/-/g, " ")}`,
        description: channel.purpose,
        type: channel.kind === "announcement" ? "announcement" : "open_chat",
        recommendedSettings: {
          onlyAdminsSendMessages: channel.kind === "announcement",
          editGroupInfoOnlyAdmins: true,
        },
      });
    }
  }

  // Pre-formatted WhatsApp broadcast texts (using WhatsApp markdown: *bold*, _italic_)
  const welcomeBroadcastText = `👋 *Selamat datang di ${blueprint.communityName}!*

Komunitas ini adalah wadah resmi untuk saling bertukar ilmu, berkolaborasi, dan tumbuh bersama.

📌 *Langkah Awal:*
1. Simpan nomor admin ini di kontak HP kamu.
2. Gabung ke sub-grup yang sesuai dengan minat kamu di bawah.
3. Patuhi aturan komunitas agar suasana tetap positif dan bermanfaat.

Selamat bergabung dan salam kenal semuanya! ✨`;

  const rulesBroadcastText = `📜 *TATA TERTIB KOMUNITAS ${blueprint.communityName.toUpperCase()}*

1. *Saling Menghargai:* Diskusi dan kritik membangun sangat diapresiasi. Dilarang keras melakukan pelecehan, SARA, atau berkata kasar.
2. *Dilarang Spam / Promo Liar:* Jangan mengirimkan link afiliasi, jualan, atau promo tanpa izin pengurus.
3. *Gunakan Grup Sesuai Topik:* Kirimkan pertanyaan atau obrolan pada sub-grup yang telah disediakan.
4. *Jaga Privasi:* Jangan menyebarkan nomor kontak anggota lain tanpa izin pemiliknya.

Pelanggaran tata tertib dapat berakibat peringatan atau dikeluarkan dari komunitas.`;

  const setupChecklist = [
    "Buka WhatsApp di HP Anda → Geser ke tab 'Komunitas' (Communities) → Ketuk 'Komunitas Baru'.",
    `Beri nama '${blueprint.communityName}' dan pasang foto profil komunitas.`,
    `Grup Pengumuman otomatis terbuat. Kirimkan pesan selamat datang ke Grup Pengumuman.`,
    `Ketuk 'Tambah Grup' untuk membuat sub-grup yang telah dirancang di bawah.`,
    "Bagikan link undangan Komunitas ke audiens Anda!",
  ];

  const pkg: WhatsAppCommunityPackage = {
    communityName: blueprint.communityName,
    description: `Official WhatsApp Community for ${blueprint.communityName}`,
    announcementGroup: {
      name: `${blueprint.communityName} · Pengumuman`,
      description: "Pusat info resmi dan broadcast pengumuman satu arah dari admin.",
      type: "announcement",
      recommendedSettings: {
        onlyAdminsSendMessages: true,
        editGroupInfoOnlyAdmins: true,
      },
    },
    subGroups,
    welcomeBroadcastText,
    rulesBroadcastText,
    setupChecklist,
  };

  return WhatsAppCommunityPackageSchema.parse(pkg);
}

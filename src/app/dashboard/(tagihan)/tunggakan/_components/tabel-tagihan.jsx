"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Search,
  Loader2,
  Info,
  Eye,
  CheckCircle2,
  XCircle,
  RefreshCw, // Icon untuk perbarui link dan status badge
  CreditCardIcon,
  User,
  Users,
  FileText,
  CalendarDays,
  DollarSign,
  ShieldCheck,
  AlertCircle,
  X,
  ListOrdered,
  History,
  ReceiptText,
  Send,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

// --- Fungsi Helper ---
const formatToIDRLocal = (numberString) => {
  const number = parseFloat(numberString);
  if (isNaN(number)) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
};

const formatDateLocal = (dateString, includeTime = false) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  const options = { day: "2-digit", month: "long", year: "numeric" };
  if (includeTime) {
    options.hour = "2-digit";
    options.minute = "2-digit";
    options.hour12 = false;
  }
  return new Intl.DateTimeFormat("id-ID", options).format(date);
};

const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

// --- Komponen StatusBadge ---
const StatusBadge = React.memo(({ status }) => {
  const lowerCaseStatus = status?.toLowerCase();
  let icon;
  let badgeClasses = "font-semibold";
  let text = status || "N/A";
  const iconSize = "h-4 w-4";

  switch (lowerCaseStatus) {
    case "paid":
    case "lunas":
      icon = <CheckCircle2 className={`mr-2 ${iconSize} text-emerald-600`} />;
      badgeClasses += " bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20";
      text = "Lunas";
      break;
    case "partial":
      icon = <RefreshCw className={`mr-2 ${iconSize} text-yellow-600`} />; // Tidak spin untuk partial
      badgeClasses += " bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20";
      text = "Sebagian";
      break;
    case "unpaid":
      icon = <XCircle className={`mr-2 ${iconSize} text-red-600`} />;
      badgeClasses += " bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20";
      text = "Belum Lunas";
      break;
    case "pending":
      icon = <RefreshCw className={`mr-2 ${iconSize} text-blue-600 animate-spin`} />;
      badgeClasses += " bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20";
      text = "Pending";
      break;
    default:
      icon = <CreditCardIcon className={`mr-2 ${iconSize} text-gray-500`} />;
      badgeClasses += " bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-600/20";
      text = status || "N/A";
      break;
  }

  return (
    <Badge
      className={`capitalize text-xs whitespace-nowrap px-2.5 py-1 rounded-full flex items-center transition-colors ${badgeClasses}`}
    >
      {icon}
      {text}
    </Badge>
  );
});
StatusBadge.displayName = "StatusBadge";

// --- Komponen ModalDetailItem ---
const ModalDetailItem = React.memo(
  ({
    label,
    value,
    icon: Icon,
    isCurrency = false,
    isStatus = false,
    statusValue,
    children,
    className,
  }) => (
    <div className={cn("flex items-start space-x-3 py-2.5", className)}>
      {Icon && (
        <Icon className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0 opacity-80" />
      )}
      <div className="flex-1">
        <p className="text-xs font-medium text-gray-500 tracking-wide uppercase">
          {label}
        </p>
        {isStatus ? (
          <div className="mt-1">
            <StatusBadge status={statusValue} />
          </div>
        ) : children ? (
          <div className="text-sm text-gray-800 font-semibold">{children}</div>
        ) : (
          <p className="text-sm text-gray-800 font-semibold">
            {isCurrency ? formatToIDRLocal(value) : value || "-"}
          </p>
        )}
      </div>
    </div>
  )
);
ModalDetailItem.displayName = "ModalDetailItem";

// --- Komponen Pagination ---
const Pagination = ({ currentPage, totalPages, onPrev, onNext }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center space-x-2 mt-6">
      <Button onClick={onPrev} disabled={currentPage === 1} variant="outline" size="sm" className="hover:bg-gray-100">
        Sebelumnya
      </Button>
      <span className="text-sm text-gray-700">
        Halaman {currentPage} dari {totalPages}
      </span>
      <Button onClick={onNext} disabled={currentPage === totalPages} variant="outline" size="sm" className="hover:bg-gray-100">
        Berikutnya
      </Button>
    </div>
  );
};

// --- Komponen DetailTagihanModal ---
const DetailTagihanModal = ({ isOpen, onClose, tagihan, onTagihanUpdate }) => { // Tambahkan onTagihanUpdate
  if (!isOpen || !tagihan) return null;

  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);
  const [sendingItemId, setSendingItemId] = useState(null);
  const [isRenewingLink, setIsRenewingLink] = useState(false); // State untuk loading perbarui link
  const [renewingItemId, setRenewingItemIdState] = useState(null); // State untuk ID item yang di-renew

  const formatDateModal = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" });
  };

  const formatDateTimeModal = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("id-ID", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const sisaTagihan = parseFloat(tagihan.total_jumlah) - parseFloat(tagihan.jumlah_bayar);

  const handleSendWhatsApp = async (item) => {
    // ... (fungsi handleSendWhatsApp tetap sama)
    if (!tagihan.siswa || !tagihan.siswa.telepon) {
      toast.error("Nomor telepon siswa tidak ditemukan.");
      return;
    }
    // Gunakan item.midtrans_url yang mungkin sudah diperbarui
    if (!item.midtrans_url) {
      toast.error("Link pembayaran (Midtrans URL) tidak ditemukan untuk item ini.");
      return;
    }

    setSendingItemId(item.id);
    setIsSendingWhatsApp(true);
    toast.info(`Mengirim notifikasi WhatsApp untuk ${item.deskripsi}...`);

    const namaSiswa = tagihan.siswa.nama;
    const kelasSiswa = tagihan.siswa.akun_siswa.kelas.nama_kelas;
    const jurusanSiswa = tagihan.siswa.akun_siswa.jurusan.nama_jurusan;
    const deskripsiTagihanItem = item.deskripsi;
    const jumlahTagihanItem = formatToIDRLocal(parseFloat(item.jumlah));
    const linkPembayaran = item.midtrans_url; // Pastikan ini menggunakan URL terbaru
    const jatuhTempoItem = item.jatuh_tempo ? formatDateModal(item.jatuh_tempo) : "segera";

    const pesan = `
Assalamu’alaikum Warahmatullahi Wabarakatuh

Yth. Bapak/Ibu Orang Tua/Wali dari Ananda *${namaSiswa}*
Kelas: *${kelasSiswa} - ${jurusanSiswa}*

Kami informasikan bahwa terdapat tagihan:
🧾 Deskripsi: *${deskripsiTagihanItem}*
💰 Jumlah: *${jumlahTagihanItem}*
🗓️ Jatuh Tempo: *${jatuhTempoItem}*

Status tagihan saat ini: BELUM LUNAS.

Silakan segera lakukan pembayaran melalui link berikut:
${linkPembayaran}

Anda dapat melakukan pembayaran melalui berbagai metode yang tersedia di halaman pembayaran (Contoh: Virtual Account Bank, QRIS, E-Wallet, Gerai Retail).

Mohon abaikan pesan ini jika Anda telah melakukan pembayaran.
Terima kasih atas perhatian dan kerjasamanya. Semoga Allah SWT senantiasa memberikan kesehatan dan kesuksesan.

Hormat kami,
Tim Keuangan Sekolah
    `.trim();

    const targetTelepon = tagihan.siswa.telepon.startsWith("0")
      ? `62${tagihan.siswa.telepon.substring(1)}`
      : tagihan.siswa.telepon;

    const formData = new FormData();
    formData.append("target", targetTelepon);
    formData.append("message", pesan);
    formData.append("schedule", "0");
    formData.append("delay", "2");
    formData.append("countryCode", "62");

    try {
      const response = await fetch("https://api.fonnte.com/send", {
        method: "POST",
        headers: { Authorization: process.env.NEXT_PUBLIC_TOKEN_FONNTE, },
        body: formData,
      });
      const result = await response.json();
      if (!response.ok || (result.status === false && result.reason)) {
        throw new Error(result?.reason || result?.message || "Gagal mengirim pesan WhatsApp.");
      }
      toast.success(`Notifikasi WhatsApp untuk ${deskripsiTagihanItem} berhasil dikirim.`);
    } catch (error) {
      console.error("Error sending WhatsApp:", error);
      toast.error(`Gagal mengirim notifikasi: ${error.message}`);
    } finally {
      setIsSendingWhatsApp(false);
      setSendingItemId(null);
    }
  };

  const handleRenewLink = async (itemToRenew) => {
    setRenewingItemIdState(itemToRenew.id);
    setIsRenewingLink(true);
    toast.info(`Memperbarui link pembayaran untuk ${itemToRenew.deskripsi}...`);

    try {
      // Ganti dengan URL API backend Anda yang sebenarnya
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"; // Contoh URL API
      const response = await fetch(`${apiUrl}/tagihan/item-tagihan/${itemToRenew.id}/renew-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',

        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        // Coba tampilkan pesan error dari backend jika ada
        const backendError = result.error || result.message || result.details || "Gagal memperbarui link.";
        throw new Error(backendError);
      }

      toast.success(`Link pembayaran untuk ${itemToRenew.deskripsi} berhasil diperbarui.`);

      // Buat objek item_tagihan yang baru dengan link yang diperbarui
      const updatedItemTagihanList = tagihan.item_tagihan.map(item =>
        item.id === itemToRenew.id
          ? { ...item, midtrans_url: result.data.midtrans_url, midtrans_order_id: result.data.midtrans_order_id }
          : item
      );
      
      // Panggil callback untuk memperbarui state tagihan di komponen induk (TabelTagihan)
      onTagihanUpdate({ ...tagihan, item_tagihan: updatedItemTagihanList });

    } catch (error) {
      console.error("Error renewing payment link:", error);
      toast.error(`Gagal memperbarui link: ${error.message}`);
    } finally {
      setIsRenewingLink(false);
      setRenewingItemIdState(null);
    }
  };


  return (
    <div
      className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-out"
      style={{ opacity: isOpen ? 1 : 0 }}
    >
      <Card
        className="bg-white w-full max-w-2xl shadow-2xl rounded-xl max-h-[90vh] flex flex-col overflow-hidden transition-all duration-300 ease-out"
        style={{
          transform: isOpen ? "scale(1) translateY(0)" : "scale(0.95) translateY(20px)",
          opacity: isOpen ? 1 : 0,
        }}
      >
        <CardHeader className="px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-xl sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
                <ReceiptText className="h-5 w-5 mr-3 text-emerald-600" /> Detail Tagihan
              </CardTitle>
              <CardDescription className="text-sm text-emerald-600 font-mono mt-1 tracking-wider">
                {tagihan.nomor_tagihan}
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full h-9 w-9">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-5 overflow-y-auto">
          {/* Informasi Siswa dan Tagihan Utama */}
          <div>
            <h3 className="text-base font-semibold text-gray-700 mb-3 flex items-center">
              <Info className="h-5 w-5 mr-2.5 text-emerald-600" /> Informasi Umum
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 rounded-lg border border-gray-200 p-4 bg-white shadow-sm">
              <ModalDetailItem label="Siswa" value={tagihan.siswa?.nama} icon={Users} />
              <ModalDetailItem
                label="Kelas"
                value={`${tagihan.siswa?.akun_siswa?.kelas?.nama_kelas || ""} - ${tagihan.siswa?.akun_siswa?.jurusan?.nama_jurusan || ""}`}
                icon={Users}
              />
              <ModalDetailItem label="NISN" value={tagihan.siswa?.akun_siswa?.nisn || "-"} icon={User} />
              <ModalDetailItem label="Telepon Siswa" value={tagihan.siswa?.telepon || "-"} icon={Users} />
              <ModalDetailItem label="Deskripsi Tagihan Utama" value={tagihan.deskripsi} icon={FileText} className="md:col-span-2"/>
              <Separator className="md:col-span-2 my-2 bg-gray-100" />
              <ModalDetailItem label="Total Tagihan" value={tagihan.total_jumlah} icon={DollarSign} isCurrency />
              <ModalDetailItem label="Sudah Dibayar" value={tagihan.jumlah_bayar} icon={CheckCircle2} isCurrency />
              <ModalDetailItem label="Sisa Tagihan" value={sisaTagihan} icon={sisaTagihan > 0 ? AlertTriangle : CheckCircle2} isCurrency />
              <ModalDetailItem label="Status Tagihan Utama" statusValue={tagihan.status} icon={tagihan.status === "paid" || tagihan.status === "lunas" ? CheckCircle2 : AlertTriangle} isStatus />
              <ModalDetailItem label="Jenis Pembayaran" value={tagihan.jenis_pembayaran?.nama || "-"} icon={CreditCardIcon} />
              <ModalDetailItem label="Tgl. Dibuat" value={formatDateLocal(tagihan.createdAt, true)} icon={CalendarDays} />
            </div>
          </div>

          {/* Rincian Item Tagihan */}
          {tagihan.item_tagihan && tagihan.item_tagihan.length > 0 && (
            <div>
              <h3 className="text-base font-semibold text-gray-700 mb-3 flex items-center">
                <ListOrdered className="h-5 w-5 mr-2.5 text-emerald-600" /> Rincian Item Tagihan ({tagihan.item_tagihan.length})
              </h3>
              <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                <Table className="min-w-full">
                  <TableHeader className="bg-gray-100/80">
                    <TableRow className="border-b-gray-200">
                      <TableHead className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Deskripsi</TableHead>
                      <TableHead className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Jatuh Tempo</TableHead>
                      <TableHead className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500 text-right">Jumlah</TableHead>
                      <TableHead className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500 text-center">Status</TableHead>
                      <TableHead className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500 text-center">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-white divide-y divide-gray-200">
                    {tagihan.item_tagihan.map((item) => (
                      <TableRow key={item.id} className="hover:bg-emerald-50/50 transition-colors duration-150">
                        <TableCell className="py-3 px-4 text-sm text-gray-700">
                          {item.deskripsi}
                          {item.bulan && item.tahun && (
                            <span className="block text-gray-500 text-xs mt-0.5">({monthNames[item.bulan - 1]} {item.tahun})</span>
                          )}
                        </TableCell>
                        <TableCell className="py-3 px-4 text-sm text-gray-600">{formatDateModal(item.jatuh_tempo)}</TableCell>
                        <TableCell className="py-3 px-4 text-sm text-gray-800 font-medium text-right">{formatToIDRLocal(item.jumlah)}</TableCell>
                        <TableCell className="py-3 px-4 text-center"><StatusBadge status={item.status} /></TableCell>
                        <TableCell className="py-3 px-4 text-center space-x-1"> {/* space-x-1 untuk jarak antar tombol */}
                          {(item.status?.toLowerCase() === "unpaid" || item.status?.toLowerCase() === "pending" || item.status?.toLowerCase() === "partial") && item.midtrans_url && tagihan.siswa?.telepon && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSendWhatsApp(item)}
                              disabled={isSendingWhatsApp && sendingItemId === item.id}
                              className="text-xs text-sky-600 border-sky-500/50 hover:bg-sky-50 hover:text-sky-700 transition-colors duration-150 px-2 py-1"
                              title="Kirim Notifikasi WhatsApp"
                            >
                              {isSendingWhatsApp && sendingItemId === item.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Send className="h-3.5 w-3.5" />
                              )}
                              <span className="ml-1.5 hidden sm:inline">WA</span>
                            </Button>
                          )}
                          {(item.status?.toLowerCase() === "unpaid" || item.status?.toLowerCase() === "pending" || item.status?.toLowerCase() === "partial") && item.midtrans_url && (
                             <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRenewLink(item)}
                                disabled={isRenewingLink && renewingItemId === item.id}
                                className="text-xs text-blue-600 border-blue-500/50 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150 px-2 py-1"
                                title="Perbarui Link Pembayaran"
                              >
                                {isRenewingLink && renewingItemId === item.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <RefreshCw className="h-3.5 w-3.5" />
                                )}
                                <span className="ml-1.5 hidden sm:inline">Link</span>
                              </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Riwayat Pembayaran */}
          {tagihan.pembayaran && tagihan.pembayaran.length > 0 && (
            // ... (bagian riwayat pembayaran tetap sama)
            <div>
              <h3 className="text-base font-semibold text-gray-700 mb-3 flex items-center">
                <History className="h-5 w-5 mr-2.5 text-emerald-600" /> Riwayat Pembayaran ({tagihan.pembayaran.length})
              </h3>
              <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                <Table>
                  <TableHeader className="bg-gray-100/80">
                    <TableRow className="border-b-gray-200">
                      <TableHead className="py-3 px-4 text-xs font-semibold uppercase text-gray-500">Tanggal</TableHead>
                      <TableHead className="py-3 px-4 text-xs font-semibold uppercase text-gray-500 text-right">Jumlah</TableHead>
                      <TableHead className="py-3 px-4 text-xs font-semibold uppercase text-gray-500">Metode</TableHead>
                      <TableHead className="py-3 px-4 text-xs font-semibold uppercase text-gray-500 text-center">Verifikasi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-white divide-y divide-gray-200">
                    {tagihan.pembayaran.map((p) => (
                      <TableRow key={p.id} className="hover:bg-emerald-50/50 transition-colors duration-150">
                        <TableCell className="py-3 px-4 text-sm text-gray-600">{formatDateTimeModal(p.createdAt)}</TableCell>
                        <TableCell className="py-3 px-4 text-sm text-gray-800 font-medium text-right">{formatToIDRLocal(p.jumlah)}</TableCell>
                        <TableCell className="py-3 px-4 text-sm text-gray-700 capitalize">{p.metode_pembayaran}</TableCell>
                        <TableCell className="py-3 px-4 text-center">
                          {p.sudah_verifikasi ? (
                            <Badge variant="outline" className="border-emerald-500 text-emerald-600 bg-emerald-50 text-xs px-2 py-0.5 font-medium">
                              <ShieldCheck className="h-3.5 w-3.5 mr-1.5" /> Terverifikasi
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-yellow-500 text-yellow-600 bg-yellow-50 text-xs px-2 py-0.5 font-medium">
                              <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Pending
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="px-6 py-4 border-t border-gray-200 bg-gray-50/70 rounded-b-xl flex justify-between items-center sticky bottom-0 z-10">
          <p className="text-xs text-gray-500">
            ID Tagihan: <span className="font-medium text-gray-700">{tagihan.id}</span>
          </p>
          <div>
            <Button onClick={onClose} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2 rounded-md shadow-sm hover:shadow-md transition-all">
              Tutup
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

// --- Komponen TabelTagihan ---
const TabelTagihan = ({
  filteredData,
  currentPage,
  setCurrentPage,
  itemsPerPage,
  totalPages,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTagihan, setSelectedTagihan] = useState(null);

  const handleOpenDetailModal = (tagihan) => {
    setSelectedTagihan(tagihan);
    setIsModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsModalOpen(false);
    // setSelectedTagihan(null); // Jangan null kan di sini agar data terbaru tetap ada jika modal dibuka lagi
  };
  
  // Fungsi untuk mengupdate selectedTagihan dari modal
  const handleTagihanUpdateFromModal = (updatedTagihanData) => {
    setSelectedTagihan(updatedTagihanData);
    // Anda mungkin juga perlu memperbarui `filteredData` jika perubahan ini juga harus tercermin di tabel utama tanpa refresh
    // Ini bisa lebih kompleks tergantung bagaimana `filteredData` dikelola
  };


  const tableHeaders = [
    "Siswa", "Kelas", "No. Tagihan", "Deskripsi", "Sisa Tagihan", "Sudah Bayar", "Status", "Aksi",
  ];

  return (
    <>
      <Card className="bg-white shadow-sm rounded-xl border border-gray-200/80 overflow-hidden">
        <CardContent className="p-0">
          {filteredData.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              <AlertCircle className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <p className="text-xl font-semibold text-gray-700">Tidak Ada Data</p>
              <p className="text-md mt-1">Tidak ditemukan tagihan yang sesuai dengan filter Anda.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table className="min-w-full">
                  <TableHeader className="bg-gray-50">
                    <TableRow className="border-b-gray-200">
                      {tableHeaders.map((headerText) => (
                        <TableHead key={headerText} className={cn("py-3.5 px-6 text-left text-xs font-semibold uppercase tracking-wider text-gray-500", headerText === "Aksi" && "text-right")}>
                          {headerText}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-white divide-y divide-gray-200">
                    {filteredData
                      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                      .map((tagihanItem) => ( // Ganti nama variabel agar tidak konflik dengan prop tagihan
                        <TableRow key={tagihanItem.id} className="hover:bg-emerald-50/50 transition-colors duration-150">
                          <TableCell className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{tagihanItem.siswa.nama}</div>
                                <div className="text-xs text-gray-500">{tagihanItem.siswa.email || ""}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {tagihanItem.siswa.akun_siswa.kelas.nama_kelas}-{tagihanItem.siswa.akun_siswa.jurusan.nama_jurusan}
                          </TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-mono">{tagihanItem.nomor_tagihan}</TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 max-w-xs truncate" title={tagihanItem.deskripsi}>
                            {tagihanItem.deskripsi}
                          </TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                            {formatToIDRLocal(parseFloat(tagihanItem.total_jumlah) - parseFloat(tagihanItem.jumlah_bayar))}
                          </TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium ">{formatToIDRLocal(tagihanItem.jumlah_bayar)}</TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap"><StatusBadge status={tagihanItem.status} /></TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Button variant="outline" size="sm" className="text-emerald-600 border-emerald-500/50 hover:bg-emerald-50 hover:text-emerald-700 transition-colors duration-150" onClick={() => handleOpenDetailModal(tagihanItem)}>
                              <Eye className="mr-2 h-4 w-4" /> Detail
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
              {filteredData.length > itemsPerPage && (
                <div className="p-4 border-t border-gray-200">
                  <Pagination currentPage={currentPage} totalPages={totalPages} onPrev={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} onNext={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      {selectedTagihan && (
        <DetailTagihanModal
          isOpen={isModalOpen}
          onClose={handleCloseDetailModal}
          tagihan={selectedTagihan}
          onTagihanUpdate={handleTagihanUpdateFromModal} // Kirim callback ke modal
        />
      )}
    </>
  );
};

export default TabelTagihan;

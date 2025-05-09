"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { z } from "zod";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Users, MessageSquare, CheckCircle2, Loader2 } from "lucide-react";

// Schema validasi
const BroadcastSchema = z.object({
  unit: z.string().min(1, "Unit harus dipilih"),
  pesan: z
    .string()
    .min(1, "Pesan tidak boleh kosong")
    .max(1000, "Pesan terlalu panjang"),
  siswaTerpilih: z.array(z.string()).optional(),
  kirimKeSemua: z.boolean().default(false),
});

const BroadcastWhatsApp = () => {
  const [units, setUnits] = useState([]);
  const [siswas, setSiswas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  const form = useForm({
    resolver: zodResolver(BroadcastSchema),
    defaultValues: {
      unit: "",
      pesan: "",
      siswaTerpilih: [],
      kirimKeSemua: false,
    },
  });

  // Fetch data unit
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        setLoadingData(true);
        const response = await fetch("http://localhost:8010/unit");
        const data = await response.json();
        setUnits(data.data);
      } catch (error) {
        toast.error("Gagal memuat data unit");
      } finally {
        setLoadingData(false);
      }
    };
    fetchUnits();
  }, []);

  // Fetch data siswa ketika unit berubah
  useEffect(() => {
    const unitId = form.watch("unit");
    if (unitId) {
      const fetchSiswas = async () => {
        try {
          setLoadingData(true);
          const response = await fetch(
            `http://localhost:8010/akun/siswa?unit=${unitId}`
          );
          const data = await response.json();
          setSiswas(data.data);
          // Reset siswa terpilih ketika unit berubah
          form.setValue("siswaTerpilih", []);
          form.setValue("kirimKeSemua", false);
        } catch (error) {
          toast.error("Gagal memuat data siswa");
        } finally {
          setLoadingData(false);
        }
      };
      fetchSiswas();
    } else {
      setSiswas([]);
    }
  }, [form.watch("unit")]);

  // Handle submit
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      toast.info("Memulai proses broadcast...");

      // Filter siswa yang akan dikirim
      let penerima = [];
      if (data.kirimKeSemua) {
        penerima = siswas.map((siswa) => siswa.telepon);
      } else {
        penerima = siswas
          .filter((siswa) => data.siswaTerpilih.includes(siswa.id.toString()))
          .map((siswa) => siswa.telepon);
      }

      if (penerima.length === 0) {
        toast.warning("Tidak ada penerima yang dipilih");
        return;
      }

      const toastId = toast.loading(`Mengirim ke ${penerima.length} penerima...`);

      const hasilPengiriman = await Promise.all(
        penerima.map(async (telepon) => {
          const formData = new FormData();
          formData.append("target", telepon);
          formData.append("message", data.pesan);
          formData.append("schedule", "0");
          formData.append("delay", "2");
          formData.append("countryCode", "62");

          try {
            const res = await fetch("https://api.fonnte.com/send", {
              method: "POST",
              headers: {
                Authorization: "QqrpmALC8wz9WvyeqtBF",
              },
              body: formData,
            });

            const result = await res.json();
            if (!res.ok) {
              throw new Error(result?.message || "Gagal mengirim pesan.");
            }
            return { telepon, status: "sukses" };
          } catch (error) {
            return { telepon, status: "gagal", error: error.message };
          }
        })
      );

      const sukses = hasilPengiriman.filter(
        (r) => r.status === "sukses"
      ).length;
      const gagal = hasilPengiriman.filter((r) => r.status === "gagal").length;

      toast.dismiss(toastId);
      toast.success(
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="text-green-500 h-5 w-5" />
            <span>Broadcast selesai!</span>
          </div>
          <div className="flex gap-4 mt-1">
            <Badge variant="success" className="px-2 py-1">
              {sukses} Sukses
            </Badge>
            <Badge variant={gagal > 0 ? "destructive" : "outline"} className="px-2 py-1">
              {gagal} Gagal
            </Badge>
          </div>
        </div>
      );
    } catch (error) {
      toast.error("Terjadi kesalahan saat mengirim: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedUnit = form.watch("unit");
  const sendToAll = form.watch("kirimKeSemua");
  const selectedStudentsCount = form.watch("siswaTerpilih")?.length || 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold text-primary">
            <Send className="h-6 w-6" />
            Broadcast WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Pilih Unit */}
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Unit Sekolah
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={loadingData}
                    >
                      <FormControl>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Pilih unit sekolah" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {loadingData ? (
                          <div className="p-2">
                            <Skeleton className="h-6 w-full" />
                          </div>
                        ) : (
                          units.map((unit) => (
                            <SelectItem
                              key={unit.id}
                              value={unit.id.toString()}
                              className="py-2"
                            >
                              {unit.nama_unit}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Pilih Siswa */}
              {selectedUnit && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="kirimKeSemua"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Kirim ke semua siswa di unit ini</FormLabel>
                          <FormDescription>
                            {siswas.length} siswa tersedia
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  {!sendToAll && (
                    <FormField
                      control={form.control}
                      name="siswaTerpilih"
                      render={() => (
                        <FormItem>
                          <div className="flex justify-between items-center mb-2">
                            <FormLabel className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              Pilih Siswa
                            </FormLabel>
                            {selectedStudentsCount > 0 && (
                              <Badge variant="secondary">
                                {selectedStudentsCount} terpilih
                              </Badge>
                            )}
                          </div>
                          <ScrollArea className="h-64 rounded-md border p-4">
                            {loadingData ? (
                              <div className="space-y-2">
                                {[...Array(5)].map((_, i) => (
                                  <Skeleton key={i} className="h-10 w-full" />
                                ))}
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 gap-3">
                                {siswas.map((siswa) => (
                                  <FormField
                                    key={siswa.id}
                                    control={form.control}
                                    name="siswaTerpilih"
                                    render={({ field }) => (
                                      <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(
                                              siswa.id.toString()
                                            )}
                                            onCheckedChange={(checked) => {
                                              return checked
                                                ? field.onChange([
                                                    ...field.value,
                                                    siswa.id.toString(),
                                                  ])
                                                : field.onChange(
                                                    field.value?.filter(
                                                      (value) =>
                                                        value !== siswa.id.toString()
                                                    )
                                                  );
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel className="font-normal flex-1">
                                          <div className="flex justify-between">
                                            <span>{siswa.nama}</span>
                                            <span className="text-muted-foreground">
                                              {siswa.telepon}
                                            </span>
                                          </div>
                                        </FormLabel>
                                      </FormItem>
                                    )}
                                  />
                                ))}
                              </div>
                            )}
                          </ScrollArea>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              )}

              {/* Isi Pesan */}
              <FormField
                control={form.control}
                name="pesan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Isi Pesan
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tulis pesan broadcast..."
                        className="min-h-[150px] text-base"
                        {...field}
                      />
                    </FormControl>
                    <div className="flex justify-between">
                      <FormDescription>
                        {field.value.length}/1000 karakter
                      </FormDescription>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={loading || loadingData}
                  className="gap-2 px-6 py-3"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Kirim Broadcast
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BroadcastWhatsApp;
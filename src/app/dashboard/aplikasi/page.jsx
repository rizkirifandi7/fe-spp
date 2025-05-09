"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Schema validasi menggunakan Zod
const sekolahSchema = z.object({
  nama_sekolah: z.string().min(3, "Nama sekolah minimal 3 karakter"),
  alamat: z.string().min(10, "Alamat terlalu pendek"),
  telepon: z.string().min(8, "Nomor telepon tidak valid"),
  email: z.string().email("Email tidak valid").or(z.literal("")),
  website: z.string().url("Website tidak valid").or(z.literal("")),
  pemilik: z.string().min(3, "Pemilik minimal 3 karakter"),
});

export default function UpdateSekolah() {
  const [sekolah, setSekolah] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(sekolahSchema),
  });

  // Fetch data sekolah
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:8010/sekolah");
        const data = response.data.data[0];
        setSekolah(data);
        reset(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Gagal memuat data sekolah");
        setIsLoading(false);
      }
    };

    fetchData();
  }, [reset]);

  // Handle image preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      for (const key in data) {
        if (data[key] !== null && data[key] !== undefined) {
          formData.append(key, data[key]);
        }
      }

      const imageInput = document.querySelector('input[type="file"]');
      if (imageInput.files[0]) {
        formData.append("gambar", imageInput.files[0]);
      }

      const response = await axios.put(
        `http://localhost:8010/sekolah/${sekolah.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Data sekolah berhasil diperbarui");
      setSekolah(response.data.data);
    } catch (error) {
      console.error("Error updating data:", error);
      toast.error("Gagal memperbarui data sekolah");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!sekolah) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Card className="p-6 text-center max-w-md">
          <p className="text-gray-600">Data sekolah tidak ditemukan</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-4xl mx-auto overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 p-6">
          <h1 className="text-2xl font-bold text-white">Update Data Sekolah</h1>
          <p className="text-emerald-100 mt-1">
            Perbarui informasi sekolah Anda
          </p>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Kolom Kiri */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nama_sekolah" className="mb-2">
                    Nama Sekolah *
                  </Label>
                  <Input
                    {...register("nama_sekolah")}
                    id="nama_sekolah"
                    type="text"
                    className={`${errors.nama_sekolah ? "border-red-500" : ""}`}
                    placeholder="Masukkan nama sekolah"
                  />
                  {errors.nama_sekolah && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.nama_sekolah.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="alamat" className="mb-2">
                    Alamat *
                  </Label>
                  <Textarea
                    {...register("alamat")}
                    id="alamat"
                    rows={3}
                    className={`${errors.alamat ? "border-red-500" : ""}`}
                    placeholder="Masukkan alamat lengkap"
                  />
                  {errors.alamat && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.alamat.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="telepon" className="mb-2">
                    Telepon *
                  </Label>
                  <Input
                    {...register("telepon")}
                    id="telepon"
                    type="tel"
                    className={`${errors.telepon ? "border-red-500" : ""}`}
                    placeholder="Masukkan nomor telepon"
                  />
                  {errors.telepon && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.telepon.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Kolom Kanan */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email" className="mb-2">
                    Email
                  </Label>
                  <Input
                    {...register("email")}
                    id="email"
                    type="email"
                    className={`${errors.email ? "border-red-500" : ""}`}
                    placeholder="Masukkan email sekolah"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="website" className="mb-2">
                    Website
                  </Label>
                  <Input
                    {...register("website")}
                    id="website"
                    type="url"
                    className={`${errors.website ? "border-red-500" : ""}`}
                    placeholder="https://example.com"
                  />
                  {errors.website && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.website.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="pemilik" className="mb-2">
                    Pemilik *
                  </Label>
                  <Input
                    {...register("pemilik")}
                    id="pemilik"
                    type="text"
                    className={`${errors.pemilik ? "border-red-500" : ""}`}
                    placeholder="Masukkan pemilik sekolah"
                  />
                  {errors.pemilik && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.pemilik.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="logo" className="mb-2">
                    Logo Sekolah
                  </Label>
                  <div className="flex items-center gap-4">
                    <div className="relative h-20 w-20 rounded-lg border border-gray-200 overflow-hidden bg-gray-100">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="h-full w-full object-cover"
                        />
                      ) : sekolah.gambar ? (
                        <img
                          src={`http://localhost:8010/uploads/${sekolah.gambar}`}
                          alt="Logo Sekolah"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-400">
                          <span className="text-xs">No image</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        id="logo"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => reset(sekolah)}
                disabled={isSubmitting}
              >
                Reset
              </Button>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Simpan Perubahan"
                )}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
"use client";

import { useAuthStore } from "@/stores/auth/authstore";
import { useEffect, useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { BiEditAlt } from "react-icons/bi";
import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Shadcn Input component
import { Label } from "@/components/ui/label";
import Loader from "@/components/loader";
import Link from "next/link";
import axios from "axios";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Daftar gender
const genders = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

// Fungsi untuk menentukan zodiac berdasarkan tanggal lahir
const getZodiac = (birthday) => {
  const date = new Date(birthday);
  const month = date.getMonth() + 1; // bulan dimulai dari 0, sehingga ditambah 1
  const day = date.getDate();

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) {
    return "Aries";
  } else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) {
    return "Taurus";
  } else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) {
    return "Gemini";
  } else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) {
    return "Cancer";
  } else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) {
    return "Leo";
  } else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) {
    return "Virgo";
  } else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) {
    return "Libra";
  } else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) {
    return "Scorpio";
  } else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) {
    return "Sagittarius";
  } else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
    return "Capricorn";
  } else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) {
    return "Aquarius";
  } else if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) {
    return "Pisces";
  }
  return "";
};

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  birthday: z
    .string()
    .regex(/^\d{2} \d{2} \d{4}$/, "Invalid date format (DD MM YYYY)"),
  height: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, "Height must be positive"),
  weight: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, "Weight must be positive"),
  interests: z
    .string()
    .min(1, "Interests are required")
    .transform((val) => val.split(",").map((item) => item.trim())), // Mengumpulkan string jadi array
  gender: z.string("Gender is required"),
});

export default function Profile() {
  const { fetchProfile, user, updateProfile } = useAuthStore(); // Ambil updateProfile dari authstore
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      birthday: user?.birthday || "",
      height: user?.height?.toString() || "",
      weight: user?.weight?.toString() || "",
      interests: user?.interests?.join(", ") || "",
      gender: user?.gender || "", // Menambahkan gender
    },
  });

  const getProfile = async () => {
    try {
      await fetchProfile(); // Memanggil fetchProfile dari store
      reset({
        name: user?.name || "",
        birthday: user?.birthday || "",
        height: user?.height?.toString() || "",
        weight: user?.weight?.toString() || "",
        interests: user?.interests?.join(", ") || "",
        gender: user?.gender || "", // Reset gender
      });
    } catch (error) {
      setProfileError(
        "Profile not found or there was an issue fetching the profile."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  const handleSaveAbout = async (data) => {
    try {
      setLoading(true);
      // Menghitung Zodiac dan Horoscope berdasarkan tanggal lahir
      const zodiac = getZodiac(data.birthday);
      const horoscope = zodiac ? `${zodiac} horoscope` : "";
      
      console.log(zodiac, horoscope);
      // Memanggil updateProfile dari store untuk update profil
      await updateProfile({
        name: data.name,
        birthday: data.birthday,
        height: parseInt(data.height),
        weight: parseInt(data.weight),
        interests: data.interests,
        gender: data.gender, // Menyertakan gender
        zodiac: zodiac, // Menyertakan zodiac
        horoscope: horoscope, // Menyertakan horoscope
      });

      setIsEditingAbout(false);
    } catch (error) {
      console.error(
        "Error updating profile:",
        error.response?.data || error.message
      );
      alert(error.response?.data?.message || "Error updating profile.");
    } finally {
      await getProfile();
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#09141A] text-white px-2 relative">
      {loading && (
        <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-30 z-50">
          <Loader /> {/* Komponen loader */}
        </div>
      )}
      <div className="flex flex-row items-center py-4">
        {!isEditingAbout ? (
          <Link href="/login" className="flex items-center">
            <IoIosArrowBack className="text-xl" />
            <span className="text-sm">Back</span>
          </Link>
        ) : (
          <div
            className="flex items-center"
            onClick={() => setIsEditingAbout(false)}
          >
            <IoIosArrowBack className="text-xl" />
            <span className="text-sm">Back</span>
          </div>
        )}
        <div className="flex flex-col items-center justify-center flex-1">
          {user && (
            <h1 className="text-sm font-semibold">
              @{user.username}
            </h1>
          )}
        </div>
      </div>
      <div className="h-40 relative bg-[#162329] rounded-lg p-4 mb-4">

      </div>
      <div className="relative bg-[#0E191F] rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold mb-1">About</h2>
          {!isEditingAbout ? (
            <button
              className="flex items-center text-white cursor-pointer"
              onClick={() => setIsEditingAbout(true)}
            >
              <BiEditAlt className="text-white cursor-pointer" />
            </button>
          ) : (
            <div></div>
          )}
        </div>

        {isEditingAbout ? (
          <form onSubmit={handleSubmit(handleSaveAbout)} className="space-y-4">
            <button
              type="submit"
              className="absolute top-4 right-4 text-sm bg-gradient-to-r from-[#94783E] via-[#F3EDA6] via-[#F8FAE5] via-[#FFE2BE] to-[#D5BE88] bg-clip-text text-transparent font-medium"
            >
              Save & Update
            </button>
            {/* Form fields */}
            <div className="flex flex-row items-center justify-between">
              <Label
                htmlFor="display"
                className="text-sm text-nowrap text-white/30"
              >
                Display Name :
              </Label>
              <div>
                <Input
                  {...register("name")}
                  placeholder="Enter Name"
                  className="bg-[#1A2B32] border border-[#30444E] rounded-md"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm">{errors.name.message}</p>
                )}
              </div>
            </div>
            <div className="flex flex-row items-center justify-between">
              <Label
                htmlFor="gender"
                className="text-sm text-nowrap text-white/30"
              >
                Gender :
              </Label>
              <div>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-[200px] justify-between text-white bg-[#1A2B32] border border-[#30444E] rounded-md px-4"
                    >
                      {value
                        ? genders.find((gender) => gender.value === value)
                            ?.label
                        : "Select gender..."}
                      <ChevronsUpDown className="opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <Command>
                      <CommandInput
                        placeholder="Search gender..."
                        className="h-9"
                      />
                      <CommandList>
                        <CommandEmpty>No gender found.</CommandEmpty>
                        <CommandGroup>
                          {genders.map((gender) => (
                            <CommandItem
                              key={gender.value}
                              value={gender.value}
                              onSelect={(currentValue) => {
                                setValue(
                                  currentValue === value ? "" : currentValue
                                );
                                setOpen(false);
                              }}
                            >
                              {gender.label}
                              <Check
                                className={cn(
                                  "ml-auto",
                                  value === gender.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {errors.gender && (
                  <p className="text-red-500 text-sm">
                    {errors.gender.message}
                  </p>
                )}
              </div>
            </div>

            {/* Birthday */}
            <div className="flex flex-row items-center justify-between">
              <Label
                htmlFor="birthday"
                className="text-sm text-nowrap text-white/30"
              >
                Birthday :
              </Label>
              <div>
                <Input
                  {...register("birthday")}
                  placeholder="DD MM YYYY"
                  className="bg-[#1A2B32] border border-[#30444E] rounded-md px-4"
                />
                {errors.birthday && (
                  <p className="text-red-500 text-sm">
                    {errors.birthday.message}
                  </p>
                )}
              </div>
            </div>

            {/* Zodiac */}
            <div className="flex flex-row items-center justify-between">
              <Label
                htmlFor="zodiac"
                className="text-sm text-nowrap text-white/30"
              >
                Zodiac :
              </Label>
              <div>
                <Input
                  {...register("zodiac")}
                  placeholder="--"
                  disabled
                  className="bg-[#1A2B32] border border-[#30444E] rounded-md px-4"
                />
              </div>
            </div>

            {/* Horoscope */}
            <div className="flex flex-row items-center justify-between">
              <Label
                htmlFor="horoscope"
                className="text-sm text-nowrap text-white/30"
              >
                Horoscope :
              </Label>
              <div>
                <Input
                  {...register("horoscope")}
                  placeholder="--"
                  disabled
                  className="bg-[#1A2B32] border border-[#30444E] rounded-md px-4"
                />
              </div>
            </div>

            {/* Height */}
            <div className="flex flex-row items-center justify-between">
              <Label
                htmlFor="height"
                className="text-sm text-nowrap text-white/30"
              >
                Height :
              </Label>
              <div>
                <Input
                  {...register("height")}
                  placeholder="Add height"
                  className="bg-[#1A2B32] border border-[#30444E] rounded-md px-4"
                />
                {errors.height && (
                  <p className="text-red-500 text-sm">
                    {errors.height.message}
                  </p>
                )}
              </div>
            </div>

            {/* Weight */}
            <div className="flex flex-row items-center justify-between">
              <Label
                htmlFor="weight"
                className="text-sm text-nowrap text-white/30"
              >
                Weight :
              </Label>
              <div>
                <Input
                  {...register("weight")}
                  placeholder="Add weight"
                  className="bg-[#1A2B32] border border-[#30444E] rounded-md px-4"
                />
                {errors.weight && (
                  <p className="text-red-500 text-sm">
                    {errors.weight.message}
                  </p>
                )}
              </div>
            </div>

            {/* Interests */}
            <div>
              <Input
                {...register("interests")}
                placeholder="Interests (comma-separated)"
                className="bg-[#1A2B32] border border-[#30444E] rounded-md px-4"
              />
              {errors.interests && (
                <p className="text-red-500 text-sm">
                  {errors.interests.message}
                </p>
              )}
            </div>
          </form>
        ) : (
          <div className="flex flex-col">
            <span className="text-white/50">Name: {user?.name || "N/A"}</span>
            <span className="text-white/50">Birthday: {user?.birthday || "N/A"}</span>
            <span className="text-white/50">Zodiac: {user?.zodiac || "N/A"}</span>
            <span className="text-white/50">
              Horoscospane: {user?.horoscospane || "N/A"}
            </span>
            <span className="text-white/50">Gender: {user?.gender || "N/A"}</span>
            <span className="text-white/50">Height: {user?.height || "N/A"} cm</span>
            <span className="text-white/50">Weight: {user?.weight || "N/A"} kg</span>
            <span className="text-white/50">
              Interests: {user?.interests?.join(", ") || "N/A"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

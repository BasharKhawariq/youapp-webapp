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
  interests: z.array(),
  gender: z.string("Gender is required"),
});

export default function Profile() {
  const { fetchProfile, user, createProfile, updateProfile } = useAuthStore(); // Ambil createProfile dari authstore
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
      interests: user?.interests?.join(", ") || [],
      gender: user?.gender || "", // Menambahkan gender
    },
  });

  // Fungsi untuk menghitung umur berdasarkan tanggal lahir
  const getAge = (birthday) => {
    const birthDate = new Date(birthday.split(" ").reverse().join("-")); // Format ke YYYY-MM-DD
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    // Jika bulan dan hari belum lewat, kurangi 1 tahun
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const getProfile = async () => {
    try {
      await fetchProfile(); // Memanggil fetchProfile dari store
      reset({
        name: user?.name || "",
        birthday: user?.birthday || "",
        height: user?.height?.toString() || "",
        weight: user?.weight?.toString() || "",
        interests: user?.interests?.join(", ") || [],
        gender: user?.gender || "", // Reset gender
        horoscope: user?.horoscope || "", // Menambahkan horoscope
        zodiac: user?.zodiac || "", // Menambahkan horoscope
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
  }, [isEditingAbout]);

  const handleSaveAbout = async (data) => {
    try {
      setLoading(true);
      // Menghitung Zodiac dan Horoscope berdasarkan tanggal lahir
      const zodiac = getZodiac(data.birthday);
      const horoscope = zodiac ? `${zodiac} horoscope` : "";

      console.log(zodiac, horoscope);
      console.log(user, "user");
      // Memanggil api dari store untuk update profil
      if (!user?.name) {
        await createProfile({
          name: data.name,
          birthday: data.birthday,
          height: parseInt(data.height),
          weight: parseInt(data.weight),
          interests: data.interests || [],
          gender: data.gender, // Menyertakan gender
          zodiac: zodiac, // Menyertakan zodiac
          horoscope: horoscope, // Menyertakan horoscope
        });
      } else {
        await updateProfile({
          name: data.name,
          birthday: data.birthday,
          height: parseInt(data.height),
          weight: parseInt(data.weight),
          interests: data.interests || null,
          gender: data.gender, // Menyertakan gender
          zodiac: zodiac, // Menyertakan zodiac
          horoscope: horoscope, // Menyertakan horoscope
        });
      }

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
    <div className="h-screen min-h-fit flex flex-col bg-[#09141A] text-white px-2 relative">
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
          {user && <h1 className="text-sm font-semibold">@{user.username}</h1>}
        </div>
      </div>
      <div className="relative min-h-40 bg-[#162329] rounded-lg p-3 mb-4">
        {user && (
          <h1 className="absolute bottom-2 left-3 text-xs font-semibold">
            @{user.username} ,  {getAge(user.birthday)}
          </h1>
        )}
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
          <form
            onSubmit={handleSubmit(handleSaveAbout)}
            className="grid grid-cols-2 items-center gap-4"
          >
            <button
              type="submit"
              className="absolute top-4 right-4 text-sm bg-gradient-to-r from-[#94783E] via-[#F3EDA6] via-[#F8FAE5] via-[#FFE2BE] to-[#D5BE88] bg-clip-text text-transparent font-medium"
            >
              Save & Update
            </button>

            {/* Display Name */}
            <div className="flex flex-col justify-start">
              <Label
                htmlFor="name"
                className="text-sm text-nowrap text-white/30"
              >
                Display Name :
              </Label>
            </div>
            <div className="flex flex-col justify-start">
              <Input
                {...register("name")}
                placeholder="Enter Name"
                className="bg-[#1A2B32] border border-[#30444E] rounded-md"
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name.message}</p>
              )}
            </div>

            {/* Gender */}
            <div className="flex flex-col justify-start">
              <Label
                htmlFor="gender"
                className="text-sm text-nowrap text-white/30"
              >
                Gender :
              </Label>
            </div>
            <div className="flex flex-col justify-start">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full md:w-[200px] justify-between text-white bg-[#1A2B32] border border-[#30444E] rounded-md px-4"
                  >
                    {value
                      ? genders.find((gender) => gender.value === value)?.label
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
                <p className="text-red-500 text-sm">{errors.gender.message}</p>
              )}
            </div>

            {/* Birthday */}
            <div className="flex flex-col justify-start">
              <Label
                htmlFor="birthday"
                className="text-sm text-nowrap text-white/30"
              >
                Birthday :
              </Label>
            </div>
            <div className="flex flex-col justify-start">
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

            {/* Zodiac */}
            <div className="flex flex-col justify-start">
              <Label
                htmlFor="zodiac"
                className="text-sm text-nowrap text-white/30"
              >
                Zodiac :
              </Label>
            </div>
            <div className="flex flex-col justify-start">
              <Input
                {...register("zodiac")}
                placeholder="--"
                disabled
                className="bg-[#1A2B32] border border-[#30444E] rounded-md px-4"
              />
            </div>

            {/* Horoscope */}
            <div className="flex flex-col justify-start">
              <Label
                htmlFor="horoscope"
                className="text-sm text-nowrap text-white/30"
              >
                Horoscope :
              </Label>
            </div>
            <div className="flex flex-col justify-start">
              <Input
                {...register("horoscope")}
                placeholder="--"
                disabled
                className="bg-[#1A2B32] border border-[#30444E] rounded-md px-4"
              />
            </div>

            {/* Height */}
            <div className="flex flex-col justify-start">
              <Label
                htmlFor="height"
                className="text-sm text-nowrap text-white/30"
              >
                Height :
              </Label>
            </div>
            <div className="flex flex-col justify-start">
              <Input
                {...register("height")}
                placeholder="Add height"
                className="bg-[#1A2B32] border border-[#30444E] rounded-md px-4"
              />
              {errors.height && (
                <p className="text-red-500 text-sm">{errors.height.message}</p>
              )}
            </div>

            {/* Weight */}
            <div className="flex flex-col justify-start">
              <Label
                htmlFor="weight"
                className="text-sm text-nowrap text-white/30"
              >
                Weight :
              </Label>
            </div>
            <div className="flex flex-col justify-start">
              <Input
                {...register("weight")}
                placeholder="Add weight"
                className="bg-[#1A2B32] border border-[#30444E] rounded-md px-4"
              />
              {errors.weight && (
                <p className="text-red-500 text-sm">{errors.weight.message}</p>
              )}
            </div>
            {/* Interests */}
            <div className="flex flex-col justify-start col-span-2">
              <Label
                htmlFor="interests"
                className="text-sm text-nowrap text-white/30"
              >
                Interests :
              </Label>
            </div>
            <div className="flex flex-col justify-start col-span-2">
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
          <div>
            {user?.name ? (
              <div className="grid grid-cols-2 items-center gap-2 text-sm">
                <span className="text-white/50">Name: </span>
                <span className="text-white">{user?.name || "--"}</span>
                <span className="text-white/50">Birthday: </span>
                <span className="text-white">
                  {user?.birthday
                    ? `${user.birthday.replace(/ /g, " / ")} (Age ${getAge(
                        user.birthday
                      )})`
                    : "--"}
                </span>

                <span className="text-white/50">Zodiac: </span>
                <span className="text-white">{user?.zodiac || "--"}</span>
                <span className="text-white/50">Horoscope: </span>
                <span className="text-white">
                  {user?.horoscope == "Error" ? "--" : user?.horoscope}
                </span>
                <span className="text-white/50">Gender: </span>
                <span className="text-white">{user?.gender || "--"}</span>
                <span className="text-white/50">Height: </span>
                <span className="text-white">
                  {user?.height || "--"} {"cm"}
                </span>
                <span className="text-white/50">Weight: </span>
                <span className="text-white">
                  {user?.weight || "--"} {"kg"}
                </span>
              </div>
            ) : (
              <span className="text-white/50 text-sm">
                Add in your your to help others know you better
              </span>
            )}
          </div>
        )}
      </div>
      {/* Interest Section */}
      <div className="relative bg-[#0E191F] rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold mb-1">Interest</h2>
          <Link
            className="flex items-center text-white cursor-pointer"
            href="/profile/interest"
          >
            <BiEditAlt className="text-white cursor-pointer" />
          </Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {user?.interests?.length > 0 ? (
            user.interests.map((interest, index) => (
              <span
                key={index}
                className="bg-white/10 text-white text-sm px-3 py-1 rounded-full"
              >
                {interest}
              </span>
            ))
          ) : (
            <span className="text-white/50 text-sm">
              Add in your interest to find a better match
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

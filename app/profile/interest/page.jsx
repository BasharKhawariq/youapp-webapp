"use client";

import { useAuthStore } from "@/stores/auth/authstore";
import * as React from "react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { IoIosArrowBack } from "react-icons/io";
import Link from "next/link";
import Loader from "@/components/loader";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

const profileSchema = z.object({
  interests: z.array(z.string()).min(1, "Interests are required"),
});

export default function InterestForm() {
  const { fetchProfile, user, createProfile } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const [tags, setTags] = React.useState([]);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    trigger, // Add trigger here
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      interests: [],
    },
  });

  useEffect(() => {
    const getProfile = async () => {
      try {
        const res = await fetchProfile();
        const userInterests = res?.interests || [];
        console.log("userInterests", userInterests);
        setTags(userInterests);
        reset({ interests: userInterests });
      } catch (error) {
        setProfileError(
          "Profile not found or there was an issue fetching the profile."
        );
      } finally {
        setLoading(false);
      }
    };
    getProfile();
  }, []);

  const addTag = (event) => {
    if (event.key === "Enter" && event.target.value.trim() !== "") {
      event.preventDefault(); // Prevent form submission
      const newTag = event.target.value.trim();
      if (!tags.includes(newTag)) {
        const updatedTags = [...tags, newTag];
        setTags(updatedTags);
        setValue("interests", updatedTags);
        trigger("interests"); // Trigger validation and update form state
      }
      event.target.value = "";
    }
  };

  const removeTag = (tagToRemove) => {
    const updatedTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(updatedTags);
    setValue("interests", updatedTags);
    trigger("interests"); // Trigger validation and update form state
  };

  const handleSaveInterest = async (data) => {
    try {
      setLoading(true);
      await createProfile({
        interests: tags,
      });
      router.push("/profile/interest");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center w-full px-4 bg-gradient-to-tr from-[#09141A] via-[#0D1D23] to-[#1F4247] text-white">
      {loading && (
        <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-30 z-50">
          <Loader /> {/* Komponen loader */}
        </div>
      )}
      <div className="absolute top-7 left-4 flex items-center">
        <Link href="/profile" className="flex items-center">
          <IoIosArrowBack className="text-xl" />
          <span className="text-sm ml-1">Back</span>
        </Link>
      </div>

      <div className="w-full max-w-md">
        <form
          onSubmit={handleSubmit(handleSaveInterest)}
          className="text-white p-2"
        >
          <button
            type="submit"
            className="absolute top-6 right-4 text-sm bg-gradient-to-r from-[#ABFFFD] via-[#4599DB] to-[#AADAFF] bg-clip-text text-transparent font-medium"
          >
            Save
          </button>

          <div className="flex flex-col gap-2 mb-8">
            <span className="block text-lg font-semibold bg-gradient-to-r from-[#94783E] via-[#F3EDA6] via-[#F8FAE5] via-[#FFE2BE] to-[#D5BE88] bg-clip-text text-transparent">
              Tell everyone about yourself
            </span>
            <label className="block text-xl font-semibold">
              What interests you?
            </label>
          </div>

          <div className="bg-[#D9D9D9]/[0.06] p-2 rounded-lg flex flex-wrap items-center gap-2 mb-2">
            {tags.map((tag, index) => (
              <div
                key={index}
                className="bg-white/10 text-white px-3 py-1 rounded-sm flex items-center gap-2"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-white text-xs font-bold"
                >
                  &times;
                </button>
              </div>
            ))}

            <input
              type="text"
              placeholder="Add your interests and press Enter"
              className="bg-transparent flex-grow text-white outline-none text-sm py-2 placeholder-gray-400"
              onKeyDown={addTag}
            />
          </div>
          {errors.interests && (
            <p className="text-red-500 text-xs mt-2">
              {errors.interests.message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

"use client";

import { useAuthStore } from "@/stores/auth/authstore";
import { useEffect, useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { BiEditAlt } from "react-icons/bi";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"; // Import Shadcn Input and Textarea components
import Link from "next/link";
import axios from "axios"; // Import axios for API requests

export default function Profile() {
  const { fetchProfile, user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [aboutInput, setAboutInput] = useState(user?.about || "");
  const [image, setImage] = useState(null);

  const getProfile = async () => {
    try {
      await fetchProfile();
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

  const handleEditAbout = () => {
    setIsEditingAbout(!isEditingAbout);
  };

  // Function to handle saving the "About" text and calling the update API
  const handleSaveAbout = async () => {
    try {
      setLoading(true);

      const response = await axios.post(
        "https://techtest.youapp.ai/api/createProfile", // Update profile API
        {
          name: user?.name || "", // You can set the name if you want to update it as well
          birthday: user?.birthday || "", // Optional field
          height: user?.height || 0, // Optional field
          weight: user?.weight || 0, // Optional field
          about: aboutInput, // Updated about text
        }
      );

      console.log("Profile updated:", response.data);
      alert("Profile updated successfully!");
      setIsEditingAbout(false); // Close editing mode
    } catch (error) {
      console.error("Error updating profile:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Error updating profile.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center bg-[#09141A] text-white">
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#09141A] text-white px-2">
      {/* Header */}
      <div className="flex flex-row items-center py-4">
        <Link href="/" className="flex items-center">
          <IoIosArrowBack className="text-xl" />
          <span className="text-sm">Back</span>
        </Link>
        <div className="flex flex-col items-center justify-center flex-1">
          <h1 className="text-sm font-semibold">
            @{user?.username || "username"}
          </h1>
        </div>
      </div>

      {/* Profile Section */}
      <div className="relative h-32 w-full bg-[#162329] rounded-lg mb-4">
        <h1 className="absolute bottom-2 left-2 text-xs font-semibold">
          @{user?.username || "username"}
        </h1>
      </div>

      {/* About Section */}
      <div className="bg-[#162329] rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium mb-1">About</h2>

          {!isEditingAbout ? (
            // Button "Edit" muncul jika mode collapsed tidak aktif
            <button
              className="flex items-center text-white cursor-pointer"
              onClick={handleEditAbout}
            >
              <BiEditAlt className="text-white cursor-pointer" />
            </button>
          ) : (
            // Button "Save & Update" muncul jika mode collapsed aktif
            <button
              className="text-sm bg-gradient-to-r from-[#94783E] via-[#F3EDA6] via-[#F8FAE5] via-[#FFE2BE] to-[#D5BE88] bg-clip-text text-transparent font-medium"
              onClick={handleSaveAbout}
            >
              Save & Update
            </button>
          )}
        </div>

        {isEditingAbout ? (
          <div className="space-y-4">
            {/* ShadCN UI Form for editing about */}
            <form onSubmit={(e) => e.preventDefault()}>
              <Textarea
                placeholder="Tell us about yourself"
                value={aboutInput}
                onChange={(e) => setAboutInput(e.target.value)}
                className="bg-[#1A2B32] border border-[#30444E] rounded-md h-20 text-lg px-4"
                rows={4}
              />
              <Button
                className="mt-4 bg-gradient-to-r from-[#94783E] via-[#F3EDA6] via-[#F8FAE5] via-[#FFE2BE] to-[#D5BE88]"
                onClick={handleSaveAbout}
              >
                Save & Update
              </Button>
            </form>
          </div>
        ) : (
          <p className="text-sm text-gray-400">
            {user?.about || "Add in your about to help others know you better"}
          </p>
        )}
      </div>

      {/* Interest Section */}
      <div className="bg-[#162329] rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium mb-1">Interest</h2>
          <BiEditAlt className="text-white cursor-pointer" />
        </div>
        <p className="text-sm text-gray-400">
          {user?.interests?.length > 0
            ? user.interests.join(", ")
            : "Add in your interest to find a better match"}
        </p>
      </div>
    </div>
  );
}

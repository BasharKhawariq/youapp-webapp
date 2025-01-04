"use client";
import { create } from "zustand";
import axios from "axios";
import Cookies from "js-cookie";

const useAuthStore = create((set) => ({
  token: null,
  user: null,
  message: null,
  isLoading: false,
  SuccessMessage: null,
  ErrorMessage: null,

  setAuthData: (token, user) => set({ token, user }),
  setMessage: (message) => set({ message }),
  setLoading: (isLoading) => set({ isLoading }),
  clearAuthData: () => set({ token: null, user: null, message: null }),

  // Login function
  login: async (email, password) => {
    set({
      isLoading: true,
      message: null,
      SuccessMessage: null,
      ErrorMessage: null,
    });

    try {
      const response = await axios.post(
        "https://techtest.youapp.ai/api/login",
        {
          email,
          username: email,
          password,
        }
      );

      const result = response.data;

      if (response.status === 201) {
        Cookies.set("token", result.access_token, {
          expires: 7,
          path: "/",
        });

        set({
          token: result.access_token,
          user: result.user,
          SuccessMessage: result.message || "Login Successful",
        });
      } else {
        set({ ErrorMessage: result.message || "Login failed" });
      }
    } catch (error) {
      set({ ErrorMessage: "Something went wrong. Please try again later." });
    } finally {
      set({ isLoading: false });
    }
  },

  // Fetch profile function with x-access-token header
  fetchProfile: async () => {
    const token = Cookies.get("token");

    if (!token) {
      set({ ErrorMessage: "No token found. Please log in again." });
      return;
    }

    try {
      const response = await axios.get(
        "https://techtest.youapp.ai/api/getProfile",
        {
          headers: {
            "x-access-token": token,
          },
        }
      );

      if (response.status === 200 && response.data?.data) {
        set({
          user: response.data.data,
          SuccessMessage: "Profile fetched successfully.",
        });
      } else {
        set({ ErrorMessage: "Failed to fetch profile." });
      }
    } catch (error) {
      set({ ErrorMessage: "Error fetching profile. Please try again later." });
    }
  },

  // Update profile function
  async updateProfile(about) {
    try {
      const response = await axios.post(
        "https://techtest.youapp.ai/api/createProfile", // API untuk pembaruan profil
        {
          name: this.user?.name || "",
          birthday: this.user?.birthday || "",
          height: this.user?.height || 0,
          weight: this.user?.weight || 0,
          about: about,
        },
        {
          headers: {
            Authorization: `Bearer ${this.token}`, // pastikan token disertakan
          },
        }
      );
      console.log("Profile updated:", response.data);
      this.user = { ...this.user, about }; // Menyimpan data terbaru ke state user
      return response.data; // Bisa menambahkan return untuk feedback
    } catch (error) {
      console.error("Error updating profile", error);
      throw error;
    }
  },
}));

export { useAuthStore };

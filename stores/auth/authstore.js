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
  updateProfile: async (userData) => {
    set({
      isLoading: true,
      ErrorMessage: null,
      SuccessMessage: null,
    });

    const token = Cookies.get("token");

    if (!token) {
      set({ ErrorMessage: "No token found. Please log in again." });
      return;
    }

    try {
      const response = await axios.put(
        "https://techtest.youapp.ai/api/updateProfile",
        userData,
        {
          headers: {
            "x-access-token": token,
          },
        }
      );

      const result = response.data;

      if (response.status === 200) {
        set({
          user: result.data,
          SuccessMessage: "Profile updated successfully.",
        });
      } else {
        set({ ErrorMessage: result.message || "Failed to update profile." });
      }
    } catch (error) {
      set({ ErrorMessage: "Error updating profile. Please try again later." });
    } finally {
      set({ isLoading: false });
    }
  },
}));

export { useAuthStore };

"use client";

import { AlertCircle } from "lucide-react";
import { IoIosArrowBack } from "react-icons/io";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import Eye Icons
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react"; // Import useState
import { useRouter } from "next/navigation"; // Gunakan useRouter untuk navigasi
import axios from "axios"; // Import axios
import { z } from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z
  .object({
    email: z.string().email({ message: "Invalid email address." }),
    username: z.string().min(1, "Username is required").max(100).trim(),
    password: z
      .string()
      .min(6, { message: "Password must be at least 8 characters." }),
    confirmPassword: z
      .string()
      .min(6, { message: "Password must be at least 8 characters." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export default function Register() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility
  const [loading, setLoading] = useState(false);

  async function handleRegister(data) {
    try {
      setLoading(true);
      const response = await axios.post(
        "https://techtest.youapp.ai/api/register",
        {
          email: data.email,
          username: data.username,
          password: data.password,
        }
      );
      console.log("Registration successful:", response.data);
      alert("Registration successful!");
    } catch (error) {
      console.error(
        "Registration failed:",
        error.response?.data || error.message
      );
      alert(error.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  const isButtonDisabled =
    !form.watch("email") ||
    !form.watch("password") ||
    !form.watch("confirmPassword") ||
    !form.watch("username");

  return (
    <div className="h-screen w-screen bg-gradient-to-tr from-[#09141A] via-[#0D1D23] to-[#1F4247] text-white">
      <div className="h-full w-full flex flex-col">
        {/* Back Button */}
        <div className="flex flex-row items-center justify-items-start gap-1 pl-5 pt-20 cursor-pointer">
          <Link href="/login" className="flex flex-row items-center gap-1">
            <IoIosArrowBack className="text-2xl" />
            <span className="font-semibold text-base">Back</span>
          </Link>
        </div>

        {/* Title */}
        <span className="text-3xl font-bold pl-12 pt-20">Register</span>

        {/* Form */}
        <div className="px-12 pt-10">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleRegister)}
              className="space-y-4"
            >
              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Enter Email"
                        className="bg-[#1A2B32] border border-[#30444E] rounded-md h-12 text-lg px-4"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Username Field */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Enter Username"
                        className="bg-[#1A2B32] border border-[#30444E] rounded-md h-12 text-lg px-4"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Create Password"
                          className="bg-[#1A2B32] border border-[#30444E] rounded-md h-12 text-lg px-4"
                          {...field}
                        />
                        <span
                          className="absolute inset-y-0 right-3 flex items-center text-xl text-gray-400 cursor-pointer"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <FaEye /> : <FaEyeSlash />}
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Confirm Password Field */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Confirm Password"
                          className="bg-[#1A2B32] border border-[#30444E] rounded-md h-12 text-lg px-4"
                          {...field}
                        />
                        <span
                          className="absolute inset-y-0 right-3 flex items-center text-xl text-gray-400 cursor-pointer"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <FaEye /> : <FaEyeSlash />}
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                className={`w-full bg-gradient-to-r from-[#4ad9ca] to-[#4a90e2] text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:shadow-xl hover:shadow-white/25 transform hover:-translate-y-1 transition-all h-12 text-lg ${
                  !isButtonDisabled ? "shadow-white/15" : ""
                }`}
                disabled={isButtonDisabled || loading}
              >
                {loading ? "Registering..." : "Register"}
              </Button>
            </form>
          </Form>
          <div className="flex flex-row justify-center items-center mt-10 gap-1 text-sm">
            <span>Have an account? </span>
            <Link href="/login">
              <span className="bg-gradient-to-r from-[#94783E] via-[#F3EDA6] via-[#F8FAE5] via-[#FFE2BE] to-[#D5BE88] bg-clip-text text-transparent font-medium underline">
                Login Here
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/stores/auth/authstore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { IoIosArrowBack } from "react-icons/io";
import Link from "next/link";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." }),
});

export default function Login() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login, SuccessMessage, ErrorMessage, isLoading } = useAuthStore();

  // Submit form handler
  async function onSubmit(data) {
    try {
      await login(data.email, data.password); // Perform login
      form.reset(); // Reset form after successful login

      // Redirect immediately after login success
      router.push("/profile"); 
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      // Optional: reset any loading state or messages if necessary
    }
  }

  const isButtonDisabled =
    !form.watch("email") || !form.watch("password") || isLoading;

  return (
    <div className="h-screen w-screen bg-gradient-to-tr from-[#09141A] via-[#0D1D23] to-[#1F4247] text-white">
      <div className="h-full w-full flex flex-col">
        <div className="flex flex-row items-center justify-items-start gap-1 pl-5 pt-20">
          <Link href="/" className="flex flex-row items-center gap-1">
            <IoIosArrowBack className="text-2xl" />
            <span className="font-semibold text-base">Back</span>
          </Link>
        </div>
        <span className="text-3xl font-bold pl-12 pt-20">Login</span>

        <div className="px-12 pt-10">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-semibold">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="bg-[#1A2B32] border border-[#30444E] rounded-md h-12 text-lg px-4"
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="mb-4 relative">
              <label htmlFor="password" className="block text-sm font-semibold">
                Password
              </label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="bg-[#1A2B32] border border-[#30444E] rounded-md h-12 text-lg px-4"
                {...form.register("password")}
              />
              <span
                className="absolute inset-y-10 right-3 flex items-center text-xl text-gray-400 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </span>
              {form.formState.errors.password && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            {/* Display success alert */}
            {SuccessMessage && (
              <div className="fixed top-12 right-10 z-50 bg-green-500 text-white rounded-lg shadow-lg p-4 flex items-center gap-3">
                <div>
                  <AlertTitle className="font-semibold">Success</AlertTitle>
                  <AlertDescription className="text-sm">
                    {SuccessMessage}
                  </AlertDescription>
                </div>
              </div>
            )}

            {/* Display error alert */}
            {ErrorMessage && !isLoading && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{ErrorMessage}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className={`w-full bg-gradient-to-r from-[#4ad9ca] to-[#4a90e2] text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:shadow-xl hover:shadow-white/25 transform hover:-translate-y-1 transition-all h-12 text-lg ${
                !isButtonDisabled ? "shadow-white/15" : ""
              }`}
              disabled={isButtonDisabled}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>

          <div className="flex flex-row justify-center items-center mt-10 gap-1 text-sm">
            <span>No account? </span>
            <Link href="/register">
              <span className="bg-gradient-to-r from-[#94783E] via-[#F3EDA6] via-[#F8FAE5] via-[#FFE2BE] to-[#D5BE88] bg-clip-text text-transparent font-medium underline">
                Register Here
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import ClonedPage from "./ClonedPage";
import { toast } from "sonner";
import { PasswordInput } from "@/components/ui/password-input";

export default function PasswordProtectedRoute() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [inputPassword, setInputPassword] = useState("");

  const correctPassword = import.meta.env.VITE_PROTECTED_PASSWORD;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPassword === correctPassword) {
      setIsAuthenticated(true);
    } else {
      toast.error("Incorrect password.");
    }
  };

  if (isAuthenticated) {
    return <ClonedPage />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen secure-body-background">
      <form
        onSubmit={handleSubmit}
        className="bg-[#212529] p-6 rounded shadow-md w-full max-w-sm"
      >
        <h2 className="text-lg font-semibold mb-4">Enter Password</h2>
        <PasswordInput
        className="bg-[#202836]"
          placeholder="Password"
          value={inputPassword}
          onChange={(e) => setInputPassword(e.target.value)}
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 mt-2 rounded hover:bg-blue-700"
        >
          Submit
        </button>
      </form>
    </div>
  );
}

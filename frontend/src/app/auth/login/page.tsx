

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/lib/auth-context";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

// ✅ FIXED COOKIE
function syncCookie() {
  const session = localStorage.getItem("session_id");
  if (session) {
    const expires = new Date(Date.now() + 7 * 864e5).toUTCString();
    document.cookie = `session_id=${session}; expires=${expires}; path=/; SameSite=Lax`;
  }
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const { login, token, loading } = useAuth();

  useEffect(() => {
    if (!loading && token) {
      syncCookie();
      window.location.href = "/chat";
    }
  }, [token, loading]);

  const validateForm = () => {
    let isValid = true;

    if (!email) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Please enter a valid email");
      isValid = false;
    } else setEmailError("");

    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      isValid = false;
    } else setPasswordError("");

    return isValid;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const success = await login(email, password);

      if (success === true) {
        syncCookie(); // ✅ IMPORTANT
        toast.success("Login successful!");
        window.location.href = "/chat";
      } else {
        toast.error("Invalid credentials");
        setPasswordError("Invalid email or password");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-black p-4">
      <Card className="w-full max-w-md bg-gray-950 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white text-center text-3xl">Welcome Back</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">

            <div>
              <Label className="text-gray-200">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                className="bg-gray-900 text-white mt-1"
                disabled={isSubmitting}
                placeholder="Enter your email"
              />
              {emailError && <p className="text-red-400 text-sm mt-1">{emailError}</p>}
            </div>

            <div>
              <Label className="text-gray-200">Password</Label>
              <div className="relative mt-1">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setPasswordError(""); }}
                  className="bg-gray-900 text-white pr-10"
                  disabled={isSubmitting}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute right-2 top-2.5 text-gray-400 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {passwordError && <p className="text-red-400 text-sm mt-1">{passwordError}</p>}
            </div>

            <Button type="submit" className="w-full bg-blue-600" disabled={isSubmitting}>
              {isSubmitting
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...</>
                : "Sign In"
              }
            </Button>

            <p className="text-center text-gray-400 text-sm">
              Don&apos;t have an account?{" "}
              <Link className="text-blue-400" href="/auth/signup">Sign up</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// "use client";

// import { useState, useEffect } from "react";
// import { useAuth } from "@/app/lib/auth-context";
// import { Button } from "@/app/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
// import { Input } from "@/app/components/ui/input";
// import { Label } from "@/app/components/ui/label";
// import Link from "next/link";
// import { Eye, EyeOff, Loader2 } from "lucide-react";
// import { toast } from "sonner";

// // ✅ FIXED COOKIE NAME
// function syncCookie() {
//   const session = localStorage.getItem("session_id");
//   if (session) {
//     const expires = new Date(Date.now() + 7 * 864e5).toUTCString();
//     document.cookie = `session_token=${session}; expires=${expires}; path=/; SameSite=Lax`;
//   }
// }

// export default function LoginPage() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [emailError, setEmailError] = useState("");
//   const [passwordError, setPasswordError] = useState("");

//   const { login, token, loading } = useAuth();

//   useEffect(() => {
//     if (!loading && token) {
//       syncCookie();
//       window.location.href = "/chat";
//     }
//   }, [token, loading]);

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();

//     setIsSubmitting(true);
//     try {
//       const success = await login(email, password);

//       if (success === true) {
//         syncCookie(); // ✅ important
//         toast.success("Login successful!");
//         window.location.href = "/chat";
//       } else {
//         toast.error("Invalid credentials");
//       }
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-black">
//         <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
//       </div>
//     );
//   }

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-black p-4">
//       <Card className="w-full max-w-md bg-gray-950 border-gray-800">
//         <CardHeader>
//           <CardTitle className="text-white text-center text-3xl">
//             Welcome Back
//           </CardTitle>
//         </CardHeader>

//         <CardContent>
//           <form onSubmit={handleLogin} className="space-y-6">

//             <div>
//               <Label className="text-gray-200">Email</Label>
//               <Input
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="bg-gray-900 text-white mt-1"
//               />
//             </div>

//             <div>
//               <Label className="text-gray-200">Password</Label>
//               <Input
//                 type={showPassword ? "text" : "password"}
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className="bg-gray-900 text-white"
//               />
//             </div>

//             <Button type="submit" className="w-full bg-blue-600">
//               {isSubmitting ? "Signing in..." : "Sign In"}
//             </Button>

//           </form>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

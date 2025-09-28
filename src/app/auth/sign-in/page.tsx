"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ButtonLoading } from "@/components/ui/button-loading";
import { authClient } from "@/lib/auth-client";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const result = await authClient.signIn.magicLink({
        email,
        name: email.split('@')[0], // Use email prefix as default name
        callbackURL: "/dashboard",
        newUserCallbackURL: "/welcome",
        errorCallbackURL: "/auth/sign-in?error=auth_failed",
      });
      
      if (result.data) {
        setMessage("Magic link sent! Please check your email and click the link to sign in.");
      } else if (result.error) {
        setError(result.error.message || "Failed to send magic link");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Welcome to Meridian
          </CardTitle>
          <CardDescription className="text-center">
            Enter your email to receive a magic link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {message && (
              <Alert>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {loading ? (
              <ButtonLoading />
            ) : (
              <Button type="submit" className="w-full">
                Send Magic Link
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
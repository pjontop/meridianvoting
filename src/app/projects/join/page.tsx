"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Users } from "lucide-react";
import Link from "next/link";

export default function JoinProject() {
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!joinCode.trim()) {
      setError("Please enter a join code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/projects/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          joinCode: joinCode.trim().toUpperCase(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to join project");
      }

      router.push(`/projects/${result.project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join project");
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
    setJoinCode(value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Join Project Team</h1>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle>Join a Project Team</CardTitle>
            <CardDescription>
              Enter the join code shared by your team lead to join their project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="joinCode">Join Code</Label>
                <Input
                  id="joinCode"
                  type="text"
                  placeholder="Enter 8-character code"
                  value={joinCode}
                  onChange={handleCodeChange}
                  maxLength={8}
                  className="text-center font-mono text-lg tracking-wider"
                  required
                />
                <p className="text-sm text-gray-500 text-center">
                  Join codes are 8 characters long (letters and numbers only)
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={loading || joinCode.length !== 8}>
                {loading ? "Joining..." : "Join Project"}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Need a join code?</h3>
              <p className="text-sm text-gray-600">
                Ask your team lead to share their project&apos;s join code with you. They can find it on their project page after creating a project.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
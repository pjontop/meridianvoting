"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ArrowRight } from "lucide-react";

export default function WelcomePage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const getUser = async () => {
            try {
                const session = await authClient.getSession();
                if (session?.data?.user) {
                    setUser(session.data.user);
                } else {
                    router.push("/sign-in");
                }
            } catch (error) {
                router.push("/sign-in");
            } finally {
                setLoading(false);
            }
        };

        getUser();
    }, [router]);

    const handleContinue = () => {
        router.push("/dashboard");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-green-800">Welcome to Meridian!</CardTitle>
                    <CardDescription>
                        You've successfully joined the voting platform
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-left space-y-2">
                        <p className="text-sm text-gray-600">
                            <strong>Hello {user?.name}!</strong>
                        </p>
                        <p className="text-sm text-gray-600">
                            Welcome to Meridian Voting Platform. Here's what you can do:
                        </p>
                        <ul className="text-sm text-gray-600 space-y-1 ml-4">
                            <li>• Create or join a project team</li>
                            <li>• Submit your project for voting</li>
                            <li>• Vote for your top 3 favorite projects</li>
                            <li>• View project submissions and demos</li>
                        </ul>
                    </div>
                    
                    <Button onClick={handleContinue} className="w-full">
                        Get Started
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
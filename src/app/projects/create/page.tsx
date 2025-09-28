"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Upload, Github, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function CreateProject() {
  const [formData, setFormData] = useState({
    name: "",
    githubUrl: "",
    demoUrl: "",
    description: "",
    image: null as File | null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) return "Project name is required";
    if (!formData.githubUrl.trim()) return "GitHub URL is required";
    if (!formData.demoUrl.trim()) return "Demo URL is required";
    if (!formData.description.trim()) return "Description is required";
    
    if (!formData.githubUrl.includes("github.com")) {
      return "Please provide a valid GitHub URL";
    }
    
    try {
      new URL(formData.githubUrl);
      new URL(formData.demoUrl);
    } catch {
      return "Please provide valid URLs";
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("githubUrl", formData.githubUrl);
      submitData.append("demoUrl", formData.demoUrl);
      submitData.append("description", formData.description);
      
      if (formData.image) {
        submitData.append("image", formData.image);
      }

      const response = await fetch("/api/projects/create", {
        method: "POST",
        body: submitData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create project");
      }

      router.push(`/projects/${result.project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setLoading(false);
    }
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
            <h1 className="text-2xl font-bold text-gray-900">Create New Project</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name *</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your project name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="githubUrl">GitHub Repository URL *</Label>
                <div className="relative">
                  <Github className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="githubUrl"
                    name="githubUrl"
                    type="url"
                    placeholder="https://github.com/username/repository"
                    value={formData.githubUrl}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="demoUrl">Live Demo URL *</Label>
                <div className="relative">
                  <ExternalLink className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="demoUrl"
                    name="demoUrl"
                    type="url"
                    placeholder="https://your-demo-url.com"
                    value={formData.demoUrl}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Link to your playable demo (itch.io, Vercel, Netlify, etc.)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Project Image</Label>
                <div className="flex items-center gap-4">
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("image")?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Image
                  </Button>
                  {formData.image && (
                    <span className="text-sm text-gray-600">{formData.image.name}</span>
                  )}
                </div>
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-w-xs h-32 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Project Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe your project, its features, and what makes it special..."
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  maxLength={500}
                  required
                />
                <p className="text-sm text-gray-500">
                  {formData.description.length}/500 characters
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Creating Project..." : "Create Project"}
                </Button>
                <Link href="/dashboard">
                  <Button type="button" variant="outline" disabled={loading}>
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
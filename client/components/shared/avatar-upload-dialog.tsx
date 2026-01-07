"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Upload, Loader2, Camera, X, Check } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// Progress bar component inline

interface AvatarUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentAvatar?: string;
  userName?: string;
  onUploadComplete: (url: string) => void;
}

export function AvatarUploadDialog({
  open,
  onOpenChange,
  currentAvatar,
  userName,
  onUploadComplete,
}: AvatarUploadDialogProps) {
  const [preview, setPreview] = useState<string | null>(null);
  // const [file, setFile] = useState<File>();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError("Image must be less than 2MB");
        return;
      }

      setError(null);

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      console.info(e.target.files)
      console.info(file)
      // setFile(() => e.target.files?.[0]);
    },
    []
  );

  const handleUpload = async () => {
    if (!preview) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Convert base64 to blob
      const base64Response = await fetch(preview);
      const blob = await base64Response.blob();

      // Validate file size again
      if (blob.size > 2 * 1024 * 1024) {
        toast.error('Image size exceeds 2MB limit. Please choose a smaller image.');
        setError('Image must be less than 2MB');
        setIsUploading(false);
        return;
      }

      // Create form data for Cloudinary (free, reliable, supports CORS)
      const formData = new FormData();
      formData.append("file", blob);
      formData.append("upload_preset", "image_realtime_collab"); // Cloudinary default unsigned preset

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      console.info(blob)
      console.info(formData)

      // Upload to Cloudinary - free, reliable, no API key required
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dawhu7iuj/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        // User-friendly error messages
        if (response.status === 413) {
          toast.error(
            "Image size is too large. Please choose a smaller image."
          );
          setError("Image is too large");
        } else if (response.status === 400) {
          toast.error("Invalid image format. Please use JPG, PNG, or GIF.");
          setError("Invalid image format");
        } else if (response.status === 503) {
          toast.error(
            "Upload service is temporarily unavailable. Please try again later."
          );
          setError("Service temporarily unavailable");
        } else {
          const errorMsg =
            errorData?.error?.message || "Upload failed. Please try again.";
          toast.error(errorMsg);
          setError(errorMsg);
        }
        return;
      }

      const data = await response.json();

      if (data.secure_url) {
        const imageUrl = data.secure_url;
        onUploadComplete(imageUrl);
        toast.success("Avatar uploaded successfully!");
        handleClose();
      } else {
        toast.error(
          "Upload completed but no image URL was returned. Please try again."
        );
        setError("No image URL returned");
      }
    } catch (err: any) {
      console.error("Upload error:", err);

      // User-friendly error messages based on error type
      if (err.message?.includes("Failed to fetch")) {
        toast.error(
          "Network error. Please check your internet connection and try again."
        );
        setError("Network error");
      } else if (err.message?.includes("capacity")) {
        toast.error(
          "Upload service is at capacity. Please try again in a few moments."
        );
        setError("Service at capacity");
      } else {
        toast.error("Failed to upload image. Please try again.");
        setError("Upload failed");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setPreview(null);
    setError(null);
    setUploadProgress(0);
    onOpenChange(false);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      // Create a synthetic event
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      const input = fileInputRef.current;
      if (input) {
        input.files = dataTransfer.files;
        input.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const getInitials = () => {
    if (userName) {
      return userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return "U";
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Upload Avatar
          </DialogTitle>
          <DialogDescription>
            Choose an image for your profile avatar. Max size 2MB.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current/Preview Avatar */}
          <div className="flex justify-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative"
            >
              <Avatar className="h-32 w-32 border-4 border-primary/10">
                <AvatarImage src={preview || currentAvatar} />
                <AvatarFallback className="text-3xl">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              {preview && (
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-8 w-8 rounded-full"
                  onClick={() => setPreview(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </motion.div>
          </div>

          {/* Upload Area */}
          {!preview && (
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm font-medium">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG, GIF up to 2MB
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />

          {/* Error Message */}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-destructive text-center"
            >
              {error}
            </motion.p>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-center text-muted-foreground">
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isUploading}
            >
              Cancel
            </Button>
            {preview ? (
              <Button onClick={handleUpload} disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Save Avatar
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={() => fileInputRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                Choose Image
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

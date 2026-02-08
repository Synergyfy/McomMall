'use client';

import React, { useState, useRef } from 'react';
import { Upload, AlertTriangle } from 'lucide-react';

// Import ShadCN UI Components
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// --- Custom Helper Component ---
const Card = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-50 rounded-xl border border-gray-200 dark:border-gray-800 shadow ${className}`}
    {...props}
  />
);

// --- Main Modal Component ---
export const ClaimBusinessModal: React.FC<{ place_id: string }> = ({
  place_id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    details: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Form Validation Logic ---
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName) newErrors.firstName = 'First name is required.';
    if (!formData.lastName) newErrors.lastName = 'Last name is required.';
    if (!formData.email) {
      newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email address is invalid.';
    }
    if (!formData.phone) newErrors.phone = 'Phone number is required.';

    // File validation
    if (file && file.size > 10 * 1024 * 1024) {
      // 10 MB
      newErrors.file = 'File size cannot exceed 10 MB.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Handle Input Changes ---
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- Handle File Changes ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          file: 'File size cannot exceed 10 MB.',
        }));
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setFile(selectedFile);
        // Clear file error if a valid file is selected
        if (errors.file) {
          const newErrors = { ...errors };
          delete newErrors.file;
          setErrors(newErrors);
        }
      }
    }
  };

  // --- Handle Form Submission ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      console.log('Form Submitted:', { ...formData, file });
      // Reset form and close modal
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        details: '',
      });
      setFile(null);
      setErrors({});
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-0 p-0 h-auto">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="border-yellow-500 text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700"
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Not Verified - Claim Listing
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white p-2 rounded-md text-xs">
                <p>
                  This listing has not been verified. Claim it to add more
                  details.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg bg-white dark:bg-black p-0">
        <form onSubmit={handleSubmit}>
          <Card className="border-0 shadow-none">
            <DialogHeader className="p-6">
              <DialogTitle className="text-lg font-semibold">
                Claim Your Business
              </DialogTitle>
              <DialogDescription className="text-gray-500 dark:text-gray-400">
                Provide verification details that will help us verify your
                business.
              </DialogDescription>
            </DialogHeader>
            <div className="px-6 pb-6 space-y-4">
              {/* Input fields for user details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    type="text"
                    placeholder="First Name"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <Input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    type="text"
                    placeholder="Last Name"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <Input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  type="email"
                  placeholder="Email"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>
              <div>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  type="tel"
                  placeholder="Phone Number"
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>

              {/* Textarea for business details (optional) */}
              <Textarea
                name="details"
                value={formData.details}
                onChange={handleChange}
                placeholder="Tell us more about your business... (Optional)"
                className="min-h-[100px] bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700"
              />

              {/* File upload section (optional) */}
              <div className="flex items-center space-x-4">
                <Button
                  asChild
                  variant="outline"
                  className="bg-gray-100 dark:bg-gray-800 cursor-pointer"
                >
                  <label htmlFor="file-upload">
                    <Upload className="mr-2 h-4 w-4" /> Upload File
                  </label>
                </Button>
                <input
                  ref={fileInputRef}
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {file ? file.name : 'Max size: 10 MB.'}
                </div>
              </div>
              {errors.file && (
                <p className="text-red-500 text-xs mt-1">{errors.file}</p>
              )}
            </div>
            <DialogFooter className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-b-xl">
              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                Claim Now
              </Button>
            </DialogFooter>
          </Card>
        </form>
      </DialogContent>
    </Dialog>
  );
};

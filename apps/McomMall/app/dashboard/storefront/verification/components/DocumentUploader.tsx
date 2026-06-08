'use client';

import React, { useState, useEffect } from 'react';
import { uploadFile } from '@/lib/upload';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { FileText, Upload, CheckCircle2, Clock, XCircle, AlertCircle, Loader2 } from 'lucide-react';

interface DocumentUploaderProps {
  listingId: string;
}

interface VerifyDoc {
  type: string;
  name: string;
  status: 'none' | 'pending' | 'approved' | 'rejected';
  url?: string;
  submittedAt?: string;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  listingId,
}) => {
  const [docs, setDocs] = useState<VerifyDoc[]>([
    { type: 'company_reg', name: 'Company Registration Certificate', status: 'none' },
    { type: 'vat_cert', name: 'VAT / Tax Certificate', status: 'none' },
    { type: 'proof_id', name: 'Director Identification Proof (ID/Passport)', status: 'none' },
  ]);

  const [uploadingType, setUploadingType] = useState<string | null>(null);

  // Load document status from localStorage on mount
  useEffect(() => {
    const savedDocs = localStorage.getItem(`storefront_verification_docs_${listingId}`);
    if (savedDocs) {
      try {
        setDocs(JSON.parse(savedDocs));
      } catch (e) {
        console.error('Failed to parse verification documents storage', e);
      }
    }
  }, [listingId]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingType(type);
    try {
      const res = await uploadFile(file);
      
      const updatedDocs = docs.map((doc) => {
        if (doc.type === type) {
          return {
            ...doc,
            status: 'pending' as const,
            url: res.secure_url,
            submittedAt: new Date().toLocaleDateString('en-GB'),
          };
        }
        return doc;
      });

      setDocs(updatedDocs);
      localStorage.setItem(`storefront_verification_docs_${listingId}`, JSON.stringify(updatedDocs));
      toast.success('Document uploaded for verification review!');
    } catch {
      toast.error('Failed to upload document. Please try again.');
    } finally {
      setUploadingType(null);
    }
  };

  const getStatusDisplay = (status: VerifyDoc['status']) => {
    switch (status) {
      case 'approved':
        return (
          <span className="text-emerald-600 font-bold text-xs flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved
          </span>
        );
      case 'pending':
        return (
          <span className="text-amber-600 font-bold text-xs flex items-center gap-1.5 bg-amber-50/70 border border-amber-100 px-2.5 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5 animate-pulse" /> Under Review
          </span>
        );
      case 'rejected':
        return (
          <span className="text-red-600 font-bold text-xs flex items-center gap-1.5 bg-red-50 border border-red-100 px-2.5 py-1 rounded-full">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </span>
        );
      default:
        return (
          <span className="text-gray-400 font-bold text-xs flex items-center gap-1.5 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full">
            <AlertCircle className="w-3.5 h-3.5" /> Not Uploaded
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-600" /> Official Verification Documents
        </h3>
        <p className="text-xs text-gray-500 leading-relaxed">
          Upload PDF or high-resolution images of official certificates to finalize listing ownership validation. Review normally takes 2–3 business days.
        </p>
      </div>

      <div className="space-y-4 max-w-2xl">
        {docs.map((doc) => (
          <div
            key={doc.type}
            className="p-4 rounded-xl border border-gray-100 hover:border-gray-200 bg-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-150 flex items-center justify-center shrink-0 text-gray-400 mt-0.5">
                <FileText className="w-4.5 h-4.5" />
              </div>
              <div className="space-y-0.5">
                <p className="font-semibold text-xs text-gray-900 leading-none">{doc.name}</p>
                <p className="text-[10px] text-gray-400">
                  {doc.submittedAt ? `Submitted on ${doc.submittedAt}` : 'Required for compliance'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 self-end sm:self-center">
              {getStatusDisplay(doc.status)}

              {doc.status === 'none' && (
                <div className="relative">
                  {uploadingType === doc.type ? (
                    <Button disabled size="sm" variant="outline" className="h-9 px-3.5 gap-1.5 text-xs font-semibold">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" className="h-9 px-3.5 gap-1.5 text-xs font-semibold">
                      <Upload className="w-3.5 h-3.5" /> Upload File
                      <input
                        type="file"
                        accept=".pdf, image/*"
                        onChange={(e) => handleUpload(e, doc.type)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

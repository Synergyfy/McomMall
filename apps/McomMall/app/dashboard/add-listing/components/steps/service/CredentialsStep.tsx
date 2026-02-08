import React from 'react';
import { ListingFormData, Media, ServiceProviderData } from '../../../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Trash2, FileText } from 'lucide-react';
import { z } from 'zod';

interface StepProps {
  formData: ListingFormData;
  setFormData: React.Dispatch<React.SetStateAction<ListingFormData>>;
  errors: Record<string, string>;
  schema?: z.ZodSchema<unknown>;
}

const isFieldOptional = (schema: z.ZodSchema<unknown>, fieldName: string) => {
    if (!schema || !('shape' in schema)) {
      return true; // Default to optional if schema is not as expected
    }
    const fieldSchema = (schema as z.ZodObject<z.ZodRawShape>).shape[fieldName];
    if (!fieldSchema) {
        return true;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (fieldSchema as any)._def.typeName === 'ZodOptional';
  };

interface MultiFileUploadProps {
    id: 'insuranceCertificates' | 'qualifications';
    title: string;
    description: string;
    files: Media[];
    onFilesChange: (id: 'insuranceCertificates' | 'qualifications', files: Media[]) => void;
    isOptional: boolean;
    error?: string;
}

const MultiFileUpload: React.FC<MultiFileUploadProps> = ({ id, title, description, files, onFilesChange, isOptional, error }) => {

    const addFile = () => {
        onFilesChange(id, [...files, { file: null, altText: '' }]);
    };

    const removeFile = (index: number) => {
        onFilesChange(id, files.filter((_, i) => i !== index));
    };

    const handleFileChange = (index: number, file: File | null) => {
        const newFiles = [...files];
        newFiles[index].file = file;
        onFilesChange(id, newFiles);
    };

    const handleAltTextChange = (index: number, altText: string) => {
        const newFiles = [...files];
        newFiles[index].altText = altText;
        onFilesChange(id, newFiles);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    {title}
                    {isOptional && (
                        <span className="text-muted-foreground font-normal text-sm">
                            {' '}
                            (optional)
                        </span>
                    )}
                </CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {files.map((media, index) => (
                    <div key={index} className="flex items-end gap-4 p-4 border rounded-lg">
                        <div className="w-16 h-16 flex items-center justify-center bg-muted rounded-lg">
                            <FileText className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div className="flex-grow space-y-2">
                           <Label htmlFor={`${id}-${index}-alt`}>Certificate/Qualification Name</Label>
                           <Input
                                id={`${id}-${index}-alt`}
                                placeholder="e.g., Gas Safe Register, NVQ Level 3 Plumbing"
                                value={media.altText}
                                onChange={(e) => handleAltTextChange(index, e.target.value)}
                           />
                           <Label htmlFor={`${id}-${index}-file`}>File (PDF, JPG, PNG)</Label>
                           <Input
                                id={`${id}-${index}-file`}
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => handleFileChange(index, e.target.files ? e.target.files[0] : null)}
                           />
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeFile(index)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                    </div>
                ))}
                 <Button variant="outline" onClick={addFile}>
                    <PlusCircle className="w-4 h-4 mr-2" /> Add Document
                </Button>
                {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
            </CardContent>
        </Card>
    )
}

const CredentialsStep: React.FC<StepProps> = ({
  formData,
  setFormData,
  errors,
  schema,
}) => {
  const serviceData = formData.serviceData || {};

  const handleFilesChange = (id: 'insuranceCertificates' | 'qualifications', files: Media[]) => {
      setFormData(prev => ({
          ...prev,
          serviceData: {
              ...prev.serviceData,
              [id]: files,
          }
      }))
  }

  return (
    <div className="space-y-6">
      <MultiFileUpload
        id="insuranceCertificates"
        title="Insurance & Certifications"
        description="Upload any insurance documents or industry certifications."
        files={serviceData.insuranceCertificates || []}
        onFilesChange={handleFilesChange}
        isOptional={isFieldOptional(schema!, 'serviceData.insuranceCertificates')}
        error={errors['serviceData.insuranceCertificates']}
      />
      <MultiFileUpload
        id="qualifications"
        title="Qualifications"
        description="Upload any relevant qualifications or awards."
        files={serviceData.qualifications || []}
        onFilesChange={handleFilesChange}
        isOptional={isFieldOptional(schema!, 'serviceData.qualifications')}
        error={errors['serviceData.qualifications']}
      />
    </div>
  );
};

export default CredentialsStep;

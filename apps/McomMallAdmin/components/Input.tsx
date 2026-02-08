import React, { ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Input } from './ui/input';

// Reusable LabelTooltip component
interface LabelTooltipProps {
  tooltipText: string;
}

export const LabelTooltip: React.FC<LabelTooltipProps> = ({ tooltipText }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button className="rounded-full h-4 w-4 p-2 bg-red-600 md:h-5 md:w-5 mb-0">
          ?
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltipText}</p>
      </TooltipContent>
    </Tooltip>
  );
};

// Reusable InputLabel component
interface InputLabelProps {
  labelText: string;
  tooltipText?: string;
}

export const InputLabel: React.FC<InputLabelProps> = ({
  labelText,
  tooltipText,
}) => {
  return (
    <label className="flex items-center gap-2 font-light text-lg">
      {labelText}
      {tooltipText && <LabelTooltip tooltipText={tooltipText} />}
    </label>
  );
};

// Reusable InputField component
interface InputFieldProps {
  type: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  type,
  value,
  onChange,
  className = '',
}) => {
  return (
    <Input
      type={type}
      value={value}
      onChange={onChange}
      className={`rounded-sm py-4 px-6 h-[3rem] ${className} w-full`}
    />
  );
};

// Reusable FileInputField component
interface FileInputFieldProps {
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

export const FileInputField: React.FC<FileInputFieldProps> = ({
  onChange,
  className = '',
}) => {
  return (
    <div
      className={`grid w-full max-w-sm items-center gap-3 ${className} sm:max-w-md md:max-w-lg lg:max-w-xl`}
    >
      <Input
        id="picture"
        type="file"
        onChange={onChange}
        className="sm:w-full"
      />
    </div>
  );
};

// Main InputComponent with external state management
interface InputComponentProps {
  labelText: string;
  tooltipText?: string;
  inputType: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  fileInput?: boolean;
  fileOnChange?: (e: ChangeEvent<HTMLInputElement>) => void; // Made optional but should be provided with fileInput
}

export const InputComponent: React.FC<InputComponentProps> = ({
  labelText,
  tooltipText,
  inputType,
  value,
  onChange,
  fileInput = false,
  fileOnChange,
}) => {
  return (
    <div className="flex flex-col gap-3 w-full">
      <InputLabel labelText={labelText} tooltipText={tooltipText} />
      {!fileInput && value !== undefined && onChange && (
        <InputField type={inputType} value={value} onChange={onChange} />
      )}
      {fileInput && fileOnChange && <FileInputField onChange={fileOnChange} />}
    </div>
  );
};

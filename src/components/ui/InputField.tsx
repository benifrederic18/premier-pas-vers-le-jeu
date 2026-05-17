import { forwardRef } from 'react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helper?: string;
}

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, helper, ...props }, ref) => {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>
        <input
          ref={ref}
          className={`w-full bg-white/5 border text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors ${
            error
              ? 'border-red-500/60 focus:border-red-400'
              : 'border-white/10 focus:border-orange-500'
          }`}
          {...props}
        />
        {helper && !error && <p className="text-gray-600 text-xs mt-1">{helper}</p>}
        {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
      </div>
    );
  }
);

InputField.displayName = 'InputField';

export default InputField;
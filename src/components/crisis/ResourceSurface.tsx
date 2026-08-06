import React from 'react';

export const ResourceSurface: React.FC = () => {
  return (
    <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-md my-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-rose-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-rose-800">Support is always available</h3>
          <div className="mt-2 text-sm text-rose-700">
            <p>If you or someone you know is feeling overwhelmed or in distress, please reach out. You are not alone.</p>
            <ul className="mt-2 list-disc list-inside space-y-1">
              <li><strong>KIRAN Mental Health Helpline:</strong> 1800-599-0019 (24/7, Toll-Free)</li>
              <li><strong>Vandrevala Foundation:</strong> 9999 666 555 (24/7)</li>
              <li><strong>iCall:</strong> 9152987821 (Mon-Sat)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

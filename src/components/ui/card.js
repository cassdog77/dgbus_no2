// src/components/ui/card.js

export const Card = ({ children, className }) => (
    <div className={`border rounded-lg p-4 shadow-sm ${className}`}>
      {children}
    </div>
  );
  
  export const CardContent = ({ children }) => (
    <div>{children}</div>
  );
// src/components/ui/button.js

export const Button = ({ children, onClick, className }) => (
    <button
      onClick={onClick}
      className={`bg-blue-500 text-white py-2 px-4 rounded ${className}`}
    >
      {children}
    </button>
  );
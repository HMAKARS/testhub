// Button.jsx
export default function Button({ children, ...props }) {
    return (
        <button
            {...props}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md text-sm shadow-md transition-colors"
        >
            {children}
        </button>
    );
}

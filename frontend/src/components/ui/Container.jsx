// src/components/ui/Container.jsx
export default function Container({ children }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
            <div className="w-full max-w-md">
                {children}
            </div>
        </div>
    );
}

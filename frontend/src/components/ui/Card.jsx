// src/components/ui/Card.jsx
export default function Card({ title, children }) {
    return (
        <div className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 shadow-lg rounded-2xl p-6 sm:p-8">
            {title && <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-white mb-4 sm:mb-6">{title}</h2>}
            {children}
        </div>
    );
}
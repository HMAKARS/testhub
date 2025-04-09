export default function Input(props) {
    return (
        <input
            {...props}
            className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
    );
}
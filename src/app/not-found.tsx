import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-12 bg-gray-1000">
      <div className="text-center mt-[-172px]">
        <h1 className="text-4xl">Not Found</h1>
        <p className="mt-4 text-lg mb-6">Could not find requested resource</p>

        <Link href="/" className="bg-blue-1000 text-white text-sm py-3 px-6 rounded-full transition duration-300 ease-in-out hover:bg-blue-1100">
            Return to Home
        </Link>
      </div>
    </div>
  );
}

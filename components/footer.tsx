export default function Footer() {
  return (
    <footer className="bg-base-100 bg-gray-900 text-center py-4 h-48">
      <p className="text-gray-300">© 2025 Code Network. All rights reserved.</p>
      <div className="mt-6">
        <a href="/about" className="text-gray-300 mx-2 hover:text-white">About Us</a>
        <a href="/contact" className="text-gray-300 mx-2 hover:text-white">Contact</a>
        <a href="/privacy-policy" className="text-gray-300 mx-2 hover:text-white">Privacy Policy</a>
      </div>
    </footer>
  );
}
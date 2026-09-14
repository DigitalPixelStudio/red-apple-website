export default function NotFound() {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center text-center px-4">
      <div>
        <h1 className="text-6xl font-poppins text-white mb-4">404</h1>
        <h2 className="text-2xl text-gray-400 mb-4">Page Not Found</h2>
        <p className="text-gray-500 mb-8">The page you're looking for doesn't exist.</p>
        <a href="/" className="bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-gray-200 transition">Go Home</a>
      </div>
    </main>
  );
}

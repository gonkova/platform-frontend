export default function Footer() {
  return (
    <footer className="bg-white border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <p className="text-sm text-gray-500">
            © 2025 AI Platform. Всички права запазени.
          </p>
          <div className="flex space-x-6 text-sm text-gray-500">
            <a href="#" className="hover:text-gray-700 transition">
              Помощ
            </a>
            <a href="#" className="hover:text-gray-700 transition">
              Документация
            </a>
            <a href="#" className="hover:text-gray-700 transition">
              Контакти
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

const MainPage = ({ children, error, title }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-rose-50 border border-rose-200 text-rose-700 px-6 py-4 rounded-2xl shadow-lg max-w-md animate-slideIn">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 flex-shrink-0">
              ⚠️
            </div>
            <div>
              <p className="font-medium">Error</p>
              <p className="text-sm text-rose-600">{error}</p>
            </div>
          </div>
        </div>
      )}
      {children}
    </div>
  );
};

export default MainPage;
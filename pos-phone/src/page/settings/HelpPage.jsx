// pages/settings/HelpPage.jsx
import { FiHelpCircle, FiBook, FiMessageCircle } from "react-icons/fi";

const HelpPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6 hover:shadow-md transition-shadow">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center">
                <FiHelpCircle className="w-5 h-5 text-white" />
              </div>
              Help
            </h1>
            <p className="text-sm text-gray-500 mt-1 ml-14">
              Getting started with the POS system
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 mb-3">
              <FiBook className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-semibold text-gray-800 mb-2">
              Quick Start
            </h2>
            <ul className="text-sm text-gray-500 space-y-1.5 list-disc list-inside">
              <li>Add products and categories before making your first sale</li>
              <li>Record stock through the Purchase management screens</li>
              <li>Create your customers and suppliers to speed up checkout</li>
              <li>Set up payment methods in Payment Method management</li>
              <li>Configure your store details in Settings</li>
            </ul>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 mb-3">
              <FiMessageCircle className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-semibold text-gray-800 mb-2">
              Need more help?
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Contact your system administrator for support, user accounts,
              and role permissions.
            </p>
            <p className="text-xs text-gray-400">
              The Settings page also lets you manage notifications and alerts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;

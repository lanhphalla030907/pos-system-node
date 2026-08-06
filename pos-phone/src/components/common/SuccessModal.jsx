function SuccessModal({ open, message, onClose }) {
  if (!open) return null;

  return (
    <div
      className="
      fixed
      inset-0
      bg-black/40
      flex
      items-center
      justify-center
      z-50
      "
    >
      <div
        className="
        bg-white
        rounded-2xl
        shadow-xl
        w-[400px]
        p-6
        text-center
        animate-fadeIn
        "
      >
        {/* Success Icon */}

        <div
          className="
          mx-auto
          w-16
          h-16
          flex
          items-center
          justify-center
          rounded-full
          bg-green-100
          mb-4
          "
        >
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h2
          className="
          text-xl
          font-semibold
          text-gray-800
          "
        >
          Success
        </h2>

        <p
          className="
          text-gray-500
          mt-2
          "
        >
          {message}
        </p>

        <button
          onClick={onClose}
          className="
          mt-6
          w-full
          bg-green-600
          text-white
          py-2
          rounded-lg
          hover:bg-green-700
          transition
          "
        >
          OK
        </button>
      </div>
    </div>
  );
}

export default SuccessModal;

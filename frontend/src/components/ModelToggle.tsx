type ModelType = "logistic" | "tree";

interface ModelToggleProps {
  modelType: ModelType;
  setModelType: (type: ModelType) => void;
}

export const ModelToggle = ({ modelType, setModelType }: ModelToggleProps) => (
  <div className='flex space-x-2 p-1 bg-gray-800 rounded-2xl border border-gray-700 w-fit'>
    {["logistic", "tree"].map((type) => (
      <button
        key={type}
        onClick={() => setModelType(type as ModelType)}
        className={`px-4 py-2 text-sm font-semibold rounded-2xl transition-colors duration-300 ${
          modelType === type
            ? "bg-blue-600 text-white shadow-lg shadow-blue-500/50"
            : "text-gray-400 hover:text-white hover:bg-gray-700"
        }`}
      >
        {type === "logistic" ? "Logistic Regression" : "Decision Tree"}
      </button>
    ))}
  </div>
);

type ModelType = "logistic" | "tree";

interface ModelToggleProps {
  modelType: ModelType;
  setModelType: (type: ModelType) => void;
}

export const ModelToggle = ({ modelType, setModelType }: ModelToggleProps) => (
  <div className='flex space-x-2 p-1 bg-black border border-gray-800 rounded-md w-fit'>
    {["logistic", "tree"].map((type) => {
      const active = modelType === type;

      return (
        <button
          key={type}
          onClick={() => setModelType(type as ModelType)}
          className={`
            px-4 py-2 text-sm font-medium rounded-md transition-colors
            ${
              active
                ? "bg-gray-900 text-white border border-gray-700"
                : "text-gray-400 hover:text-white hover:bg-gray-900"
            }
          `}
        >
          {type === "logistic" ? "Logistic Regression" : "Decision Tree"}
        </button>
      );
    })}
  </div>
);

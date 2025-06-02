import { useState, type ChangeEvent, type FC } from 'react';


interface ModelSelectorProps {
  models: string[];
  onSelect: (model: string) => void;
}

const ModelSelector: FC<ModelSelectorProps> = ({ models, onSelect }) => {
  const [selectedModel, setSelectedModel] = useState<string>('');

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setSelectedModel(value);
    onSelect(value); // pass selected value to parent
  };

  return (
   <div className="model-selector w-full mx-auto p-4 bg-slate-100 shadow-lg rounded-xl">
  <label htmlFor="model-dropdown" className="block text-lg font-medium text-gray-700 mb-2">
    Select a Model:
  </label>
  <select
    id="model-dropdown"
    value={selectedModel}
    onChange={handleChange}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 bg-white"
  >
    <option value="" disabled>
      -- Choose a Model --
    </option>
    {models.map((model, index) => (
      <option key={index} value={model}>
        {model}
      </option>
    ))}
  </select>
</div>

  );
};

export default ModelSelector;

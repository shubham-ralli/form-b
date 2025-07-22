import { ElementsType } from "@/types/FormElements";

export const FormElements = {
  TextField: {
    // ...existing configuration...
    formComponent: ({ element, submitValue, isInvalid, defaultValue }) => {
      return (
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700">
            {element.extraAttributes?.label}
          </label>
          <input
            type="text"
            className={`mt-1 block w-full rounded-md border ${
              isInvalid ? "border-red-500" : "border-gray-300"
            } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
            defaultValue={defaultValue}
            placeholder={element.extraAttributes?.placeholder}
            onChange={(e) => submitValue(e.target.value)}
          />
        </div>
      );
    },
  },
  // Update other form elements similarly...
  // ...existing code...
};

// Add drag handle component
export function DragHandle() {
  return (
    <div className="cursor-move opacity-50 hover:opacity-100">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <path fill="currentColor" d="M8 18h8v-2H8v2zm0-4h8v-2H8v2zm0-4h8V8H8v2zm0-4h8V4H8v2z"/>
      </svg>
    </div>
  );
}
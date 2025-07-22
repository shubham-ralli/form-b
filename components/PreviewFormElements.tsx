import { FormElements } from "./FormElements";
import { FormElementInstance } from "@/types/FormElements";

export default function PreviewFormElement({ element }: { element: FormElementInstance }) {
  const Element = FormElements[element.type];

  if (!Element) {
    return null;
  }

  return (
    <Element.formComponent
      element={element}
      submitValue={(value: string) => {
        // Handle value submission in preview mode
        console.log('Preview value:', value);
      }}
      isInvalid={false}
      defaultValue=""
    />
  );
}

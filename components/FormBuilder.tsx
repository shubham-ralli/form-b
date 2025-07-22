import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useState } from 'react';

// ...existing imports...

export default function FormBuilder() {
  // ...existing code...

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(elements);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setElements(items);
  };

  return (
    <div className="flex w-full h-full gap-4">
      <div className="w-[400px] max-w-[400px] flex flex-col flex-grow gap-3 border-r p-4">
        {/* ...existing sidebar code... */}
      </div>
      
      <div className="w-full h-full">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="form-elements">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="p-4"
              >
                {elements.map((element, index) => (
                  <Draggable
                    key={element.id}
                    draggableId={element.id}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="mb-4"
                      >
                        <DesignerElementWrapper element={element} />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}
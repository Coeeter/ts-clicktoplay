'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import {
  DragDropContext,
  DragDropContextProps,
  Draggable,
} from 'react-beautiful-dnd';
import { StrictModeDroppable } from './StrictModeDroppable';

export const DraggableList = (
  props: Omit<DragDropContextProps, 'children'> & {
    size: number;
    getId: (index: number) => string;
    itemBuilder: (index: number) => JSX.Element;
    droppableId: string;
    className: string;
    emptyBuilder?: () => JSX.Element;
    enabled?: boolean;
  }
) => {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <DragDropContext
      {...props}
      onDragStart={(...args) => {
        props.onDragStart?.(...args);
        setIsDragging(true);
      }}
      onDragEnd={(...args) => {
        props.onDragEnd?.(...args);
        setIsDragging(false);
      }}
    >
      <StrictModeDroppable droppableId={props.droppableId}>
        {provided => {
          return (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={props.className}
            >
              <AnimatePresence>
                {Array.from({ length: props.size }).map((_, index) => {
                  const id = props.getId(index);

                  return (
                    <Draggable
                      draggableId={id}
                      index={index}
                      key={id}
                      isDragDisabled={
                        props.enabled === false || props.size === 0
                      }
                    >
                      {provided => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <motion.div
                            key={id + '-motion'}
                            layout={true}
                            transition={{
                              duration: isDragging ? 0 : undefined,
                            }}
                          >
                            {props.itemBuilder(index)}
                          </motion.div>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
              </AnimatePresence>
              {props.size === 0 && props.emptyBuilder?.()}
              {provided.placeholder}
            </div>
          );
        }}
      </StrictModeDroppable>
    </DragDropContext>
  );
};

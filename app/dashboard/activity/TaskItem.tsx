import React from 'react';
import { Task } from './tasks';

interface TaskItemProps {
  task: Task;
  isCompleted: boolean;
  onToggle: (taskId: number) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, isCompleted, onToggle }) => {
  return (
    <div
      className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
        isCompleted ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-50 dark:bg-gray-700'
      }`}
      onClick={() => onToggle(task.id)}
    >
      <div className="flex items-center">
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center mr-4 ${
            isCompleted ? 'bg-green-500' : 'border-2 border-gray-300'
          }`}
        >
          {isCompleted && (
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <div>
          <h3 className={`font-semibold ${isCompleted ? 'line-through text-gray-500' : 'text-gray-800 dark:text-white'}`}>
            {task.title}
          </h3>
          <p className={`text-sm ${isCompleted ? 'line-through text-gray-400' : 'text-gray-600 dark:text-gray-400'}`}>
            {task.description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;

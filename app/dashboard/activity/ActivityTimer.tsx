'use client';
import React, { useState, useEffect } from 'react';
import { tasks, Task } from './tasks';
import TaskItem from './TaskItem';

const ActivityTimer = () => {
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour in seconds
  const [completedTasks, setCompletedTasks] = useState<number[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const toggleTask = (taskId: number) => {
    setCompletedTasks((prevCompleted) =>
      prevCompleted.includes(taskId)
        ? prevCompleted.filter((id) => id !== taskId)
        : [...prevCompleted, taskId]
    );
  };

  const progress = (completedTasks.length / tasks.length) * 100;

  return (
    <div className="p-4 md:p-8 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Activity Tracker</h1>
          <p className="text-gray-600 dark:text-gray-400">Stay productive and keep track of your tasks.</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Time Remaining</h2>
            <div className="text-2xl font-bold text-orange-600">
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
            <div className="bg-orange-600 h-4 rounded-full" style={{ width: `${(timeLeft / 3600) * 100}%` }}></div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Tasks</h2>
          <div className="space-y-4">
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                isCompleted={completedTasks.includes(task.id)}
                onToggle={toggleTask}
              />
            ))}
          </div>
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white">Progress</h3>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2">
              <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{Math.round(progress)}% complete</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityTimer;

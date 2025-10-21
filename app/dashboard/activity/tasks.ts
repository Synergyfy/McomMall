export interface Task {
  id: number;
  title: string;
  description: string;
}

export const tasks: Task[] = [
  {
    id: 1,
    title: 'Create a new project',
    description: 'Set up the initial project structure and dependencies.',
  },
  {
    id: 2,
    title: 'Design the user interface',
    description: 'Create mockups and wireframes for the application.',
  },
  {
    id: 3,
    title: 'Develop the backend API',
    description: 'Implement the necessary API endpoints and database schema.',
  },
  {
    id: 4,
    title: 'Build the frontend components',
    description: 'Translate the UI designs into functional React components.',
  },
  {
    id: 5,
    title: 'Test the application',
    description: 'Perform unit, integration, and end-to-end testing.',
  },
];

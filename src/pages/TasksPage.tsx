import TaskCard, { type Task } from "../components/card/TaskCard";
import "./tasksPage.scss";

interface TasksPageProps {
  tasks: Task[];
  onToggle: (id: string) => void;
}

const TasksPage = ({ tasks, onToggle }: TasksPageProps) => {
  return (
    <div className="tasks-page">

      <div className="tasks-grid">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onToggleStatus={onToggle}
          />
        ))}
      </div>
    </div>
  );
};

export default TasksPage;

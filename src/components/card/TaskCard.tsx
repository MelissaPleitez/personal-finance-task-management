import Button from "../button/Button";
import "./TaskCard.scss";

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: "pending" | "completed";
}

interface TaskCardProps {
  task: Task;
  onToggleStatus: (id: string) => void;
}

const TaskCard = ({ task, onToggleStatus }: TaskCardProps) => {
  return (
    <div className={`task-card ${task.status === "completed" ? "completed" : ""}`}>
      <div className="task-card__header">
        <h3>{task.title}</h3>
        <span className={`badge badge--${task.status}`}>
          {task.status}
        </span>
      </div>

      <p className="task-card__description">{task.description}</p>

      <div className="task-card__footer">
        <small>{task.dueDate}</small>
        <Button text="Toggle Status" onClick={() => onToggleStatus(task.id)} />
      </div>
    </div>
  );
};

export default TaskCard;

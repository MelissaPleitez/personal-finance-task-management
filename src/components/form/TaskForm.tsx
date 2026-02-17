import { useState } from "react";
import "./taskForm.scss";
import type { Task } from "../card/TaskCard";
import Input from "../input/Input";
import Button from "../button/Button";

interface TaskFormProps {
  onCreate: (task: Task) => void;
}

const TaskForm = ({ onCreate }: TaskFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      description,
      dueDate,
      status: "pending",
    };

    onCreate(newTask);

    setTitle("");
    setDescription("");
    setDueDate("");
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {/* <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        required
      /> */}
      <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />

      {/* <button type="submit">Create Task</button> */}
      <Button text="Create Task" type="submit" />
    </form>
  );
};

export default TaskForm;

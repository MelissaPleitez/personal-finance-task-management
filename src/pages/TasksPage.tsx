import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, CheckCircle2, Clock, Circle, Pencil, Trash2 } from "lucide-react"
import api from "@/lib/axios"
import useTasks from "@/hooks/useTasks"
import { TaskCategory, TaskPriority, TaskStatus, type Task } from "@/types/task.types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import StatCard from "@/components/shared/StatCard"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

// ── priority colors ──
const priorityConfig = {
  [TaskPriority.LOW]:    { label: 'Low',    class: 'bg-green-500/20 text-green-400' },
  [TaskPriority.MEDIUM]: { label: 'Medium', class: 'bg-amber-500/20 text-amber-400' },
  [TaskPriority.HIGH]:   { label: 'High',   class: 'bg-red-500/20 text-red-400' },
}

// ── task card component ──
const TaskCard = ({ task, onEdit, onDelete, isConfirming, setDeletingId }: {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (id: number) => void
  isConfirming: boolean
  setDeletingId: (id: number | null) => void
}) => {
  const priority = priorityConfig[task.priority]

  return (
    <div className="p-3 bg-navy-900 border border-navy-700 rounded-lg hover:border-violet-500/50 transition-all group">
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-white text-sm font-medium leading-snug">{task.title}</p>
        <Badge className={`text-xs border-0 flex-shrink-0 ${priority.class}`}>
          {priority.label}
        </Badge>
      </div>

      {task.description && (
        <p className="text-slate-500 text-xs line-clamp-2 mb-2">{task.description}</p>
      )}

      <div className="flex items-center justify-between mt-2">
        <Badge className="text-xs bg-navy-700 text-slate-400 border-0 capitalize">
          {task.category}
        </Badge>

        {!isConfirming ? (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(task)}
              className="p-1 rounded hover:bg-navy-700 text-slate-400 hover:text-violet-400 transition-all"
              title="Edit task"
            >
              <Pencil size={12} />
            </button>
            <button
              onClick={() => setDeletingId(task.id)}
              className="p-1 rounded hover:bg-navy-700 text-slate-400 hover:text-red-400 transition-all"
              title="Delete task"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Delete?</span>
            <button
              onClick={() => onDelete(task.id)}
              className="px-2 py-1 rounded text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
            >
              Yes
            </button>
            <button
              onClick={() => setDeletingId(null)}
              className="px-2 py-1 rounded text-xs bg-navy-700 text-slate-400 hover:bg-navy-600 transition-all"
            >
              No
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── draggable card wrapper ──
const DraggableCard = ({ task, onEdit, onDelete, isConfirming, setDeletingId }: {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (id: number) => void
  isConfirming: boolean
  setDeletingId: (id: number | null) => void
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  }

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <TaskCard
        task={task}
        onEdit={onEdit}
        onDelete={onDelete}
        isConfirming={isConfirming}
        setDeletingId={setDeletingId}
      />
    </div>
  )
}

// ── droppable column ──
const DroppableColumn = ({ id, children, color, label, icon: Icon, iconColor, count, onAddClick }: {
  id: string
  children: React.ReactNode
  color: string
  label: string
  icon: React.ElementType
  iconColor: string
  count: number
  onAddClick: () => void
}) => {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={`border border-t-4 ${color} rounded-xl p-4 min-h-[400px] flex flex-col transition-all ${
        isOver ? 'bg-navy-700 border-violet-500/30' : 'bg-navy-800 border-navy-700'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon size={16} className={iconColor} />
          <h3 className="text-sm font-semibold text-white">{label}</h3>
        </div>
        <span className="text-xs bg-navy-700 text-slate-400 px-2 py-0.5 rounded-full">
          {count}
        </span>
      </div>

      <div className="space-y-2 flex-1">
        {children}
      </div>

      <button
        onClick={onAddClick}
        className="mt-3 w-full flex items-center justify-center gap-1 py-2 text-xs text-slate-500 hover:text-slate-300 hover:bg-navy-700 rounded-lg transition-all border border-dashed border-navy-700 hover:border-navy-600"
      >
        <Plus size={12} />
        Add task
      </button>
    </div>
  )
}

// ── schema ──
const createTasksSchema = z.object({
  title:       z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().max(200).optional(),
  status:      z.nativeEnum(TaskStatus),
  priority:    z.nativeEnum(TaskPriority),
  category:    z.nativeEnum(TaskCategory),
})

type CreateTasksFormData = z.infer<typeof createTasksSchema>

// ── main page ──
const TasksPage = () => {
  const { tasks, loading, error, refetch, totalTasks, completedTasks, pendingTasks: pendingCount, inProgressTasks: inProgressCount } = useTasks()
  const [open, setOpen] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CreateTasksFormData>({
    resolver: zodResolver(createTasksSchema),
    defaultValues: { status: TaskStatus.PENDING }
  })

  // ── filters ──
  const pendingTasks    = tasks.filter(t => t.status === TaskStatus.PENDING)
  const inProgressTasks = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS)
  const doneTasks       = tasks.filter(t => t.status === TaskStatus.DONE)

  const columns = [
    { id: TaskStatus.PENDING,     label: 'Pending',     tasks: pendingTasks,    color: 'border-t-amber-500',  icon: Circle,       iconColor: 'text-amber-500',  count: pendingTasks.length },
    { id: TaskStatus.IN_PROGRESS, label: 'In Progress', tasks: inProgressTasks, color: 'border-t-blue-500',   icon: Clock,        iconColor: 'text-blue-500',   count: inProgressTasks.length },
    { id: TaskStatus.DONE,        label: 'Done',        tasks: doneTasks,       color: 'border-t-green-500',  icon: CheckCircle2, iconColor: 'text-green-500',  count: doneTasks.length },
  ]

  // ── drag handlers ──
  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id)
    if (task) setActiveTask(task)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return
    if (active.id === over.id) return

    const taskId = active.id as number
    const newStatus = over.id as TaskStatus
    const task = tasks.find(t => t.id === taskId)
    if (!task || task.status === newStatus) return

    try {
      await api.put(`/tasks/${taskId}`, {
        status: newStatus
      })
      refetch()
    } catch (error){
      console.error('Failed to update task status', error)
    }
  }

  // ── crud handlers ──
  const onSubmit = async (data: CreateTasksFormData) => {
    try {
      setCreateError(null)
      if (editingTask) {
        await api.put(`/tasks/${editingTask.id}`, data)
      } else {
        await api.post('/tasks', data)
      }
      refetch()
      setOpen(false)
      reset()
      setEditingTask(null)
    } catch {
      setCreateError(editingTask ? 'Failed to update task' : 'Failed to create task')
    }
  }

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    reset({
      title:       task.title,
      description: task.description ?? '',
      status:      task.status,
      priority:    task.priority,
      category:    task.category,
    })
    setOpen(true)
  }

  const handleDelete = async (taskId: number) => {
    try {
      await api.delete(`/tasks/${taskId}`)
      setDeletingId(null)
      refetch()
    } catch {
      console.error('Failed to delete task')
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-slate-400">Loading tasks...</p>
    </div>
  )

  if (error) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-red-400">{error}</p>
    </div>
  )

  return (
    <div className="space-y-6">

      {/* ── stat cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Tasks"  value={String(totalTasks)}      subtitle="All tasks" />
        <StatCard title="Pending"      value={String(pendingCount)}     valueColor="text-amber-400" subtitle="Not started" />
        <StatCard title="In Progress"  value={String(inProgressCount)}  valueColor="text-blue-400"  subtitle="Being worked on" />
        <StatCard title="Completed"    value={String(completedTasks)}   valueColor="text-green-400" subtitle="Done" />
      </div>

      {/* ── header ── */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Kanban Board</h2>
        <Button onClick={() => setOpen(true)} size="sm" className="bg-violet-500 hover:bg-violet-600 text-white">
          <Plus size={16} className="mr-1" />
          New Task
        </Button>
      </div>

      {/* ── kanban board ── */}
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-3 gap-4">
          {columns.map(col => (
            <DroppableColumn
              key={col.id}
              id={col.id}
              color={col.color}
              label={col.label}
              icon={col.icon}
              iconColor={col.iconColor}
              count={col.count}
              onAddClick={() => setOpen(true)}
            >
              {col.tasks.length === 0 ? (
                <div className="flex items-center justify-center h-24 border border-dashed border-navy-700 rounded-lg">
                  <p className="text-slate-600 text-xs">No tasks</p>
                </div>
              ) : (
                col.tasks.map(task => (
                  <DraggableCard
                    key={task.id}
                    task={task}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    isConfirming={deletingId === task.id}
                    setDeletingId={setDeletingId}
                  />
                ))
              )}
            </DroppableColumn>
          ))}
        </div>

        {/* drag overlay — floating card while dragging */}
        <DragOverlay>
          {activeTask ? (
            <div className="rotate-2 opacity-90 shadow-2xl">
              <TaskCard
                task={activeTask}
                onEdit={() => {}}
                onDelete={() => {}}
                isConfirming={false}
                setDeletingId={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* ── modal ── */}
      <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen)
        if (!isOpen) { setEditingTask(null); reset() }
      }}>
        <DialogContent className="bg-navy-800 border-navy-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingTask ? 'Edit Task' : 'New Task'}
            </DialogTitle>
          </DialogHeader>

          {createError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{createError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Title</Label>
              <Input placeholder="e.g. Review monthly budget" className="bg-navy-900 border-navy-700 text-white" {...register("title")} />
              {errors.title && <p className="text-red-400 text-xs">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Description <span className="text-slate-500">(optional)</span></Label>
              <Input placeholder="Add more details..." className="bg-navy-900 border-navy-700 text-white" {...register("description")} />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Status</Label>
              <select className="w-full h-9 px-3 rounded-md bg-navy-900 border border-navy-700 text-white text-sm" {...register("status")}>
                <option value={TaskStatus.PENDING}>Pending</option>
                <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
                <option value={TaskStatus.DONE}>Done</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Priority</Label>
              <select className="w-full h-9 px-3 rounded-md bg-navy-900 border border-navy-700 text-white text-sm" {...register("priority")}>
                <option value="">Select priority...</option>
                <option value={TaskPriority.LOW}>Low</option>
                <option value={TaskPriority.MEDIUM}>Medium</option>
                <option value={TaskPriority.HIGH}>High</option>
              </select>
              {errors.priority && <p className="text-red-400 text-xs">{errors.priority.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Category</Label>
              <select className="w-full h-9 px-3 rounded-md bg-navy-900 border border-navy-700 text-white text-sm" {...register("category")}>
                <option value="">Select category...</option>
                <option value={TaskCategory.WORK}>Work</option>
                <option value={TaskCategory.PERSONAL}>Personal</option>
                <option value={TaskCategory.FINANCE}>Finance</option>
                <option value={TaskCategory.STUDY}>Study</option>
                <option value={TaskCategory.FREELANCER}>Freelancer</option>
                <option value={TaskCategory.GYM}>Gym</option>
              </select>
              {errors.category && <p className="text-red-400 text-xs">{errors.category.message}</p>}
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1 border-navy-700 text-slate-300" onClick={() => { setOpen(false); setEditingTask(null); reset() }}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1 bg-violet-500 hover:bg-violet-600 text-white">
                {isSubmitting
                  ? editingTask ? "Saving..." : "Creating..."
                  : editingTask ? "Save Changes" : "Create Task"
                }
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  )
}

export default TasksPage
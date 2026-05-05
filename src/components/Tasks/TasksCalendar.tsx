import { useState } from 'react';
import type { Task } from '../../services/tasksService';
import './TasksCalendar.css';

interface TasksCalendarProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export function TasksCalendar({ tasks, onTaskClick }: TasksCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const formatDateKey = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const tasksByDate = tasks.reduce((acc, task) => {
    if (task.due_date) {
      const dateKey = task.due_date;
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(task);
    }
    return acc;
  }, {} as Record<string, Task[]>);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const goPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToday = () => {
    setCurrentDate(new Date());
  };

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push({ day: null, dateKey: null });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = formatDateKey(year, month, d);
    days.push({ day: d, dateKey });
  }

  return (
    <div className="tasks-calendar">
      <div className="calendar-header">
        <button onClick={goPrevMonth} className="nav-btn">◀</button>
        <h3>{monthNames[month]} {year}</h3>
        <button onClick={goNextMonth} className="nav-btn">▶</button>
        <button onClick={goToday} className="today-btn">Aujourd'hui</button>
      </div>
      <div className="calendar-weekdays">
        <span>Lun</span><span>Mar</span><span>Mer</span><span>Jeu</span><span>Ven</span><span>Sam</span><span>Dim</span>
      </div>
      <div className="calendar-grid">
        {days.map((day, idx) => {
          const isToday = day.day && new Date(year, month, day.day).getTime() === today.getTime();
          const dayTasks = day.dateKey ? tasksByDate[day.dateKey] || [] : [];
          return (
            <div key={idx} className={`calendar-day ${!day.day ? 'empty' : ''} ${isToday ? 'today' : ''}`}>
              {day.day && (
                <>
                  <div className="day-number">{day.day}</div>
                  <div className="day-tasks">
                    {dayTasks.map(task => (
                      <button key={task.id} className="task-item" onClick={() => onTaskClick(task)}>
                        {task.title}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
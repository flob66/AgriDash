import { useState, useEffect } from 'react';
import type { Task } from '../../services/tasksService';
import { getCalendarReminders, type ReminderWithTask } from '../../services/remindersService';
import { useAuth } from '../../hooks/useAuth';
import './TasksCalendar.css';

interface TasksCalendarProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export function TasksCalendar({ tasks, onTaskClick }: TasksCalendarProps) {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<ReminderWithTask[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    if (user) {
      loadReminders();
    }
  }, [user]);

  const loadReminders = async () => {
    if (!user) return;
    try {
      const data = await getCalendarReminders(user.id);
      setReminders(data);
    } catch (error) {
      console.error('Error loading reminders:', error);
    }
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1;
  };

  const formatDateKey = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const tasksByDate = tasks.reduce((acc, task) => {
    if (task.due_date) {
      const dateKey = task.due_date;
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push({ type: 'task', data: task });
    }
    return acc;
  }, {} as Record<string, { type: string; data: any }[]>);

  const remindersByDate = reminders.reduce((acc, reminder) => {
    const dateKey = reminder.reminder_date;
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push({ type: 'reminder', data: reminder });
    return acc;
  }, {} as Record<string, { type: string; data: any }[]>);

  const itemsByDate: Record<string, { type: string; data: any }[]> = {};
  Object.keys(tasksByDate).forEach(date => {
    itemsByDate[date] = [...(tasksByDate[date] || []), ...(remindersByDate[date] || [])];
  });
  Object.keys(remindersByDate).forEach(date => {
    if (!itemsByDate[date]) itemsByDate[date] = [];
    itemsByDate[date] = [...itemsByDate[date], ...(remindersByDate[date] || [])];
  });

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

  const goPrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const goNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push({ day: null, dateKey: null });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = formatDateKey(year, month, d);
    days.push({ day: d, dateKey });
  }

  const handleReminderClick = (reminder: ReminderWithTask) => {
    const task = tasks.find(t => t.id === reminder.task_id);
    if (task) onTaskClick(task);
  };

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
          const dayItems = day.dateKey ? itemsByDate[day.dateKey] || [] : [];
          return (
            <div key={idx} className={`calendar-day ${!day.day ? 'empty' : ''} ${isToday ? 'today' : ''}`}>
              {day.day && (
                <>
                  <div className="day-number">{day.day}</div>
                  <div className="day-items">
                    {dayItems.map((item, i) => {
                      if (item.type === 'task') {
                        return (
                          <button key={i} className="task-item" onClick={() => onTaskClick(item.data)}>
                            📋 {item.data.title}
                          </button>
                        );
                      } else {
                        return (
                          <button key={i} className="reminder-item" onClick={() => handleReminderClick(item.data)}>
                            🔔 {item.data.reminder_name}
                          </button>
                        );
                      }
                    })}
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
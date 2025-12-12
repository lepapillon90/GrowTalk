import { useState } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from "date-fns";
import { ko } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Schedule {
    id: string;
    title: string;
    date: any; // Timestamp or Date
    description?: string;
}

interface CalendarViewProps {
    schedules: Schedule[];
    onDateSelect: (date: Date) => void;
    selectedDate?: Date | null;
}

export default function CalendarView({ schedules, onDateSelect, selectedDate }: CalendarViewProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    // Helper to check if a day has schedules
    const hasSchedules = (day: Date) => {
        return schedules.some(schedule => {
            const scheduleDate = schedule.date.toDate ? schedule.date.toDate() : new Date(schedule.date);
            return isSameDay(day, scheduleDate);
        });
    };

    return (
        <div className="bg-bg-paper rounded-2xl border border-white/5 p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-text-primary">
                    {format(currentMonth, "yyyy년 M월", { locale: ko })}
                </h2>
                <div className="flex gap-2">
                    <button onClick={prevMonth} className="p-1 hover:bg-white/5 rounded-full text-text-secondary hover:text-text-primary transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={nextMonth} className="p-1 hover:bg-white/5 rounded-full text-text-secondary hover:text-text-primary transition-colors">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {["일", "월", "화", "수", "목", "금", "토"].map((day, i) => (
                    <div key={day} className={cn("text-xs font-medium py-1",
                        i === 0 ? "text-red-400" :
                            i === 6 ? "text-blue-400" : "text-text-secondary"
                    )}>
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, idx) => {
                    const isCurrentMonth = isSameMonth(day, monthStart);
                    const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                    const isDayToday = isToday(day);
                    const hasEvents = hasSchedules(day);
                    const isSunday = day.getDay() === 0;
                    const isSaturday = day.getDay() === 6;

                    return (
                        <button
                            key={day.toISOString()}
                            onClick={() => onDateSelect(day)}
                            className={cn(
                                "aspect-square flex flex-col items-center justify-center rounded-xl relative transition-all",
                                !isCurrentMonth && "text-text-secondary/30",
                                isCurrentMonth && !isSelected && isSunday && "text-red-400",
                                isCurrentMonth && !isSelected && isSaturday && "text-blue-400",
                                isCurrentMonth && !isSelected && !isSunday && !isSaturday && "text-text-primary",
                                isCurrentMonth && "hover:bg-white/5",
                                isSelected && "bg-brand-500 text-white hover:bg-brand-600 shadow-md",
                                !isSelected && isDayToday && "border border-brand-500/50"
                            )}
                        >
                            <span className="text-sm font-medium">{format(day, "d")}</span>

                            {/* Dot Indicator */}
                            {hasEvents && (
                                <div className={cn(
                                    "w-1 h-1 rounded-full mt-1",
                                    isSelected ? "bg-white" : "bg-brand-500"
                                )} />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface DateSeparatorProps {
    date: Date;
}

export default function DateSeparator({ date }: DateSeparatorProps) {
    const formattedDate = format(date, "yyyy년 M월 d일 EEEE", { locale: ko });

    return (
        <div className="flex items-center justify-center my-4">
            <div className="flex-1 h-px bg-white/5"></div>
            <span className="px-4 text-xs text-text-secondary/70">{formattedDate}</span>
            <div className="flex-1 h-px bg-white/5"></div>
        </div>
    );
}

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: {
        value: number;
        label: string;
    };
    color?: "amber" | "blue" | "green" | "red" | "purple";
}

export function StatCard({ title, value, icon, trend, color = "amber" }: StatCardProps) {
    const colorClasses = {
        amber: "bg-amber-600/20 border-amber-600/30 text-amber-400",
        blue: "bg-blue-600/20 border-blue-600/30 text-blue-400",
        green: "bg-green-600/20 border-green-600/30 text-green-400",
        red: "bg-red-600/20 border-red-600/30 text-red-400",
        purple: "bg-purple-600/20 border-purple-600/30 text-purple-400",
    };

    const iconBgClasses = {
        amber: "bg-amber-600/20 text-amber-400",
        blue: "bg-blue-600/20 text-blue-400",
        green: "bg-green-600/20 text-green-400",
        red: "bg-red-600/20 text-red-400",
        purple: "bg-purple-600/20 text-purple-400",
    };

    return (
        <div className={`relative p-6 rounded-2xl border ${colorClasses[color]} backdrop-blur-sm`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-400 mb-2">{title}</p>
                    <p className="text-3xl font-bold text-white">{value}</p>
                    {trend && (
                        <div className="flex items-center gap-2 mt-3">
                            <span className={`text-sm font-medium ${trend.value >= 0 ? "text-green-400" : "text-red-400"}`}>
                                {trend.value >= 0 ? "+" : ""}{trend.value}%
                            </span>
                            <span className="text-xs text-gray-500">{trend.label}</span>
                        </div>
                    )}
                </div>
                <div className={`p-3 rounded-xl ${iconBgClasses[color]}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}
import {
    BikeIcon,
    DumbbellIcon,
    FootprintsIcon,
    PersonStandingIcon,
    TimerIcon,
    WavesIcon,
    PlusIcon,
    Trash2Icon,
    Loader2Icon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { quickActivities, activityColors } from "../assets/assets";
import Card from "../components/ui/Card";
import confirmToast from "../components/CustomToast";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import api from "../configs/api";
import toast from "react-hot-toast";
import Select from "../components/ui/Select";

const ActivityLog = () => {
    const { allActivityLogs, setAllActivityLogs } = useAppContext();

    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        duration: 0,
        calories: 0,
    });

    const today = useMemo(() => new Date().toISOString().split("T")[0], []);

    const activityIconMap = {
        walking: FootprintsIcon,
        running: PersonStandingIcon,
        cycling: BikeIcon,
        swimming: WavesIcon,
        yoga: TimerIcon,
        weights: DumbbellIcon,
    } as const;

    // ✅ Filter today's activities from global logs
    const activities = useMemo(() => {
        return (allActivityLogs || []).filter((a: any) => {
            const createdAt = a?.createdAt || a?.attributes?.createdAt;
            if (!createdAt) return false;

            return createdAt.split("T")[0] === today;
        });
    }, [allActivityLogs, today]);

    const totalMinutes: number = activities.reduce((sum, a: any) => sum + (a.duration || a.attributes?.duration || 0), 0);

    const getRateByName = (name: string) => {
        const found = quickActivities.find((a) => a.name === name);
        return found?.rate || 0;
    };

    const handleQuickAdd = (activity: (typeof quickActivities)[number]) => {
        setFormData({
            name: activity.name,
            duration: 30,
            calories: activity.rate * 30,
        });
        setShowForm(true);
    };

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();

        if (!formData.name || formData.duration <= 0) {
            toast.error("Please fill all fields");
            return;
        }

        try {
            setLoading(true);

            const payload = {
                name: formData.name,
                duration: formData.duration,
                calories: formData.calories,
            };

            const res = await api.post("/api/activity-logs", { data: payload });

            // Strapi might return { data: { id, attributes } } OR raw object depending on controller
            const newEntry = res.data?.data ?? res.data;

            setAllActivityLogs((prev) => [...(prev || []), newEntry]);

            toast.success("Activity added");

            setFormData({ name: "", duration: 0, calories: 0 });
            setShowForm(false);
        } catch (error: any) {
            console.log(error?.response?.data);
            toast.error("Failed to add activity");
        } finally {
            setLoading(false);
        }
    };

    const handleDurationChange = (v: string | number) => {
        const duration = Number(v);
        if (Number.isNaN(duration)) return;

        const safeDuration = Math.max(0, duration);
        const rate = getRateByName(formData.name);

        setFormData((prev) => ({
            ...prev,
            duration: safeDuration,
            calories: prev.name ? rate * safeDuration : 0,
        }));
    };

    const activityOptions = quickActivities.map((a) => ({
        value: a.name,
        label: a.name,
    }));

    const activityOrder = ["walking", "running", "cycling", "swimming", "yoga", "weights"] as const;
    type ActivityType = typeof activityOrder[number];

    // Grouping for UI (works for both Strapi formats)
    const groupedActivities = useMemo(() => {
        return activities.reduce(
            (acc, entry: any) => {
                const name = entry?.name ?? entry?.attributes?.name;
                const found = quickActivities.find((a) => a.name === name);
                const type = found?.icon as ActivityType;

                if (!type || !activityOrder.includes(type)) return acc;

                acc[type].push(entry);
                return acc;
            },
            {
                walking: [],
                running: [],
                cycling: [],
                swimming: [],
                yoga: [],
                weights: [],
            } as Record<ActivityType, any[]>
        );
    }, [activities]);

    const handleActivityChange = (v: string | number) => {
        const name = v.toString();
        const rate = getRateByName(name);

        setFormData((prev) => ({
            ...prev,
            name,
            duration: prev.duration > 0 ? prev.duration : 30,
            calories: rate * (prev.duration > 0 ? prev.duration : 30),
        }));
    };

    const handleDeleteActivity = async (entry: any) => {
        const confirmation = await confirmToast("Are you sure you want to delete it?");
        if (!confirmation) return;

        try {
            setLoading(true);

            const id = entry?.id;
            if (!id) {
                toast.error("Invalid activity");
                return;
            }

            await api.delete(`/api/activity-logs/${id}`);

            setAllActivityLogs((prev) => (prev || []).filter((a: any) => a.id !== id));

            toast.success("Activity deleted");
        } catch (error: any) {
            console.log(error?.response?.data);
            toast.error("Failed to delete activity");
        } finally {
            setLoading(false);
        }
    };

    const formatDuration = (minutes: number) => {
        if (minutes < 60) return `${minutes} min`;

        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;

        if (mins === 0) return `${hrs} hr`;
        return `${hrs} hr ${mins} min`;
    };

    return (
        <div className="page-container">
            {/* ---------------- Header ---------------- */}
            <div className="page-header pt-6!">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Activity Log</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Track your workouts</p>
                    </div>

                    <div className="text-right">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Active Today</p>

                        <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                            {formatDuration(totalMinutes)}
                        </p>
                    </div>
                </div>
            </div>

            {/* ---------------- Row ---------------- */}
            <div className="page-content-grid">
                {/* ---------------- Quick Add Section ---------------- */}
                {!showForm && (
                    <div className="space-y-4">
                        <Card>
                            <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">Quick Add</h3>

                            <div className="flex flex-wrap gap-2">
                                {quickActivities.map((activity) => {
                                    const Icon = activityIconMap[activity.icon];

                                    return (
                                        <button
                                            key={activity.name}
                                            type="button"
                                            onClick={() => handleQuickAdd(activity)}
                                            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl cursor-pointer font-medium text-slate-700 dark:text-slate-200 transition-colors text-sm"
                                        >
                                            <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                            <span>{activity.name}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </Card>

                        <Button className="w-full" type="button" onClick={() => setShowForm(true)}>
                            <PlusIcon className="size-5" />
                            Add Activity
                        </Button>
                    </div>
                )}

                {/* ---------------- Add Form ---------------- */}
                {showForm && (
                    <div className="space-y-4">
                        <Card className="border-2 border-blue-200 dark:border-blue-800">
                            <h3 className="font-semibold text-slate-800 dark:text-white mb-4">New Activity</h3>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <Select
                                    label="Activity Type"
                                    required
                                    value={formData.name}
                                    onChange={handleActivityChange}
                                    options={activityOptions}
                                    placeholder="Select activity"
                                />

                                <div className="flex gap-4">
                                    <Input
                                        label="Duration (minutes)"
                                        value={formData.duration}
                                        onChange={handleDurationChange}
                                        placeholder="e.g., 30"
                                        required
                                        type="number"
                                        className="no-spinner"
                                        min={1}
                                    />

                                    <Input
                                        label="Calories Burned"
                                        value={formData.calories}
                                        onChange={() => { }}
                                        placeholder="Auto calculated"
                                        required
                                        readOnly
                                        type="number"
                                        className="no-spinner"
                                        min={0}
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <Button
                                        className="flex-1"
                                        variant="secondary"
                                        type="button"
                                        onClick={() => {
                                            setShowForm(false);
                                            setFormData({ name: "", duration: 0, calories: 0 });
                                        }}
                                    >
                                        Cancel
                                    </Button>

                                    <Button className="flex-1" type="submit" disabled={loading}>
                                        {loading ? "Adding..." : "Add Activity"}
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    </div>
                )}

                {/* ---------------- Activities List ---------------- */}
                {activities.length === 0 ? (
                    <Card className="text-center py-12">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                            <TimerIcon className="size-8 text-slate-400 dark:text-slate-500" />
                        </div>

                        <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-2">
                            No activities logged today
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            Start tracking your workouts to stay consistent
                        </p>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {activityOrder.map((activityType) => {
                            const activityEntries = groupedActivities[activityType];
                            if (activityEntries.length === 0) return null;

                            const Icon = activityIconMap[activityType];

                            return (
                                <Card key={activityType}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`w-10 h-10 rounded-xl flex items-center justify-center ${activityColors[activityType]}`}
                                            >
                                                <Icon className="size-5" />
                                            </div>

                                            <div>
                                                <h3 className="font-semibold text-slate-800 dark:text-white capitalize">
                                                    {activityType}
                                                </h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                    {activityEntries.length} items
                                                </p>
                                            </div>
                                        </div>

                                        <p className="font-semibold text-slate-700 dark:text-slate-200">
                                            {activityEntries.reduce((sum: number, a: any) => {
                                                const cal = a?.calories ?? a?.attributes?.calories ?? 0;
                                                return sum + cal;
                                            }, 0)}{" "}
                                            kcal
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        {activityEntries.map((entry: any) => {
                                            const id = entry.id;
                                            const name = entry?.name ?? entry?.attributes?.name;
                                            const duration = entry?.duration ?? entry?.attributes?.duration ?? 0;
                                            const calories = entry?.calories ?? entry?.attributes?.calories ?? 0;

                                            return (
                                                <div key={id} className="activity-entry-item">
                                                    <div className="flex-1">
                                                        <p className="font-medium text-slate-700 dark:text-slate-200">{name}</p>

                                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                                            {formatDuration(duration)}
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                                                            {calories} kcal
                                                        </span>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteActivity(entry)}
                                                            className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg cursor-pointer transition-colors"
                                                        >
                                                            <Trash2Icon className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {loading && (
                    <div className="fixed inset-0 bg-slate-100/50 dark:bg-slate-900/50 backdrop-blur flex items-center justify-center">
                        <Loader2Icon className="size-10 text-blue-600 dark:text-blue-400 animate-spin" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityLog;

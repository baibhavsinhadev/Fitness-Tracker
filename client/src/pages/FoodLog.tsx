import { Coffee, Sandwich, Utensils, Cookie, PlusIcon, SparkleIcon, Loader2Icon, UtensilsCrossedIcon, Trash2Icon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAppContext } from "../context/AppContext";
import type { FoodEntry, FormData } from "../types";
import Card from "../components/ui/Card";
import { mealColors, mealTypeOptions, quickActivitiesFoodLog } from "../assets/assets";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import toast from "react-hot-toast";
import confirmToast from "../components/CustomToast";
import api from "../configs/api";

const FoodLog = () => {

    const { allFoodLogs, setAllFoodLogs } = useAppContext();

    const [entries, setEntries] = useState<FoodEntry[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<FormData>({
        name: '',
        calories: 1,
        mealType: ''
    });

    const inputRef = useRef<HTMLInputElement>(null);

    const mealIconMap = {
        coffee: Coffee,
        sandwich: Sandwich,
        utensils: Utensils,
        cookie: Cookie,
    } as const;

    const mealTypeIconMap = {
        breakfast: Coffee,
        lunch: Sandwich,
        dinner: Utensils,
        snack: Cookie,
    } as const;

    const today = new Date().toISOString().split('T')[0];
    const totalCalories = entries.reduce((sum, e) => sum + e.calories, 0);

    const mealOrder = ["breakfast", "lunch", "dinner", "snack"] as const;
    type MealType = "breakfast" | "lunch" | "dinner" | "snack";

    const groupedEntries = entries.reduce(
        (acc, entry) => {
            const mealType = entry.mealType?.trim().toLowerCase() as MealType;

            if (!["breakfast", "lunch", "dinner", "snack"].includes(mealType)) {
                return acc;
            }

            acc[mealType].push(entry);
            return acc;
        },

        {
            breakfast: [],
            lunch: [],
            dinner: [],
            snack: [],
        } as Record<MealType, FoodEntry[]>
    );

    const loadEntries = () => {
        const todaysEntries = (allFoodLogs || []).filter((e: any) => {
            const createdAt = e?.createdAt || e?.attributes?.createdAt;
            return createdAt?.split("T")[0] === today;
        });

        setEntries(todaysEntries);
    };

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setLoading(true);

            const form = new FormData();
            form.append("image", file);

            const res = await api.post("/api/image-analysis", form, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            const items = res.data?.result?.items;

            if (!items || !Array.isArray(items)) {
                toast.error("AI response invalid");
                return;
            }

            // Example: auto-fill first item into form
            const first = items[0];
            if (first) {
                setFormData({
                    name: first.food_name,
                    calories: Math.round(first.estimated_calories),
                    mealType: "",
                });

                setShowForm(true);
            }

            toast.success("AI analysis complete");
        } catch (error: any) {
            console.log(error?.response?.data);
            toast.error("Failed to analyze image");
        } finally {
            setLoading(false);

            // allow re-upload same file
            e.target.value = "";
        }
    };

    const handleQuickAdd = (mealType: string) => {
        setFormData((prev) => ({ ...prev, mealType }));
        setShowForm(true);
    };

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();

        if (formData.name === "" || formData.mealType === "" || formData.calories === 0) {
            toast.error("Each Field is required");
            return;
        }

        try {
            setLoading(true);

            const res = await api.post("/api/food-logs", { data: formData });

            const newEntry = res.data?.data ?? res.data;

            setAllFoodLogs((prev) => [...(prev || []), newEntry]);

            toast.success("Food added");

            setFormData({
                name: "",
                calories: 1,
                mealType: "",
            });

            setShowForm(false);
        } catch (error: any) {
            console.log(error?.response?.data);
            toast.error(error?.response?.data?.error?.message || "Failed to add food");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteEntry = async (entry: any) => {
        const confirmation = await confirmToast("Are you sure you want to delete it?");
        if (!confirmation) return;

        try {
            setLoading(true);

            const id = entry?.id;
            if (!id) {
                toast.error("Invalid entry");
                return;
            }

            await api.delete(`/api/food-logs/${id}`);

            setAllFoodLogs((prev) => (prev || []).filter((e: any) => e.id !== id));

            toast.success("Entry deleted");
        } catch (error: any) {
            console.log(error?.response?.data);
            toast.error("Failed to delete entry");
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        (() => {
            loadEntries();
        })()
    }, [allFoodLogs]);

    return (
        <div className="page-container">
            {/* ---------------- Header ---------------- */}
            <div className="page-header pt-6!">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Food Log</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Track your daily intake</p>
                    </div>

                    <div className="text-right">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Today's Total</p>
                        <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{totalCalories} kcal</p>
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
                                {quickActivitiesFoodLog.map((food) => {
                                    const Icon = mealIconMap[food.icon];

                                    return (
                                        <button onClick={() => handleQuickAdd(food.name)} type="button" className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl cursor-pointer font-medium text-slate-700 dark:text-slate-200 transition-colors text-sm" key={food.name}>
                                            <Icon className="h-5 w-5 text-slate-700 dark:text-slate-200" />
                                            <span className="capitalize">{food.name}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        </Card>

                        <Button className="w-full" type="button" onClick={() => setShowForm(true)}>
                            <PlusIcon className="size-5" />
                            Add Food Entry
                        </Button>

                        <Button className="w-full" type="button" onClick={() => inputRef.current?.click()}>
                            <SparkleIcon className="size-5" />
                            AI Food Snap
                        </Button>

                        <input accept="image/*" hidden type="file" onChange={handleImageSelect} ref={inputRef} />

                        {loading && (
                            <div className="fixed inset-0 bg-slate-100/50 dark:bg-slate-900/50 backdrop-blur flex items-center justify-center">
                                <Loader2Icon className="size-10 text-emerald-600 dark:text-emerald-400 animate-spin" />
                            </div>
                        )}
                    </div>
                )}

                {/* ---------------- Add Form ---------------- */}
                {showForm && (
                    <Card className="border-2 border-emerald-200 dark:border-emerald-800">
                        <h3 className="font-semibold text-slate-800 dark:text-white mb-4">New Food Entry</h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input label="Food Name" value={formData.name} onChange={(v) => setFormData({ ...formData, name: v.toString() })} placeholder="e.g., Grilled Chicken Salad" required type="text" />

                            <Input label="Calories" value={formData.calories} onChange={(v) => setFormData({ ...formData, calories: Number(v) })} placeholder="e.g., 350" required type="number" className="no-spinner" min={1} />

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Meal Type <span className="text-red-500 ml-1">*</span>
                                    </label>

                                    {formData.mealType && (
                                        (() => {
                                            const Icon =
                                                mealTypeIconMap[formData.mealType as keyof typeof mealTypeIconMap];

                                            return (
                                                <Icon className="h-5 w-5 text-slate-500 dark:text-slate-300" />
                                            );
                                        })()
                                    )}
                                </div>

                                <Select required value={formData.mealType} onChange={(v) => setFormData({ ...formData, mealType: v.toString() })} options={mealTypeOptions} placeholder="Select meal type" />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button
                                    className="flex-1" variant="secondary" type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        setFormData({
                                            name: '',
                                            calories: 1,
                                            mealType: ''
                                        })
                                    }}
                                >
                                    Cancel
                                </Button>

                                <Button className="flex-1" type="submit">Add Entry</Button>
                            </div>
                        </form>

                    </Card>
                )}

                {/* ---------------- Entries List ---------------- */}
                {entries.length === 0 ? (
                    <Card className="text-center py-12">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                            <UtensilsCrossedIcon className="size-8 text-slate-400 dark:text-slate-500" />
                        </div>

                        <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-2">No food logged today</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Start tracking your meals to stay on target</p>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {mealOrder.map((mealType) => {
                            const mealEntries = groupedEntries[mealType];
                            if (mealEntries.length === 0) return null;

                            const Icon = mealTypeIconMap[mealType];

                            return (
                                <Card key={mealType}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${mealColors[mealType]}`}>
                                                <Icon className="size-5" />
                                            </div>

                                            <div>
                                                <h3 className="font-semibold text-slate-800 dark:text-white capitalize">{mealType}</h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">{groupedEntries[mealType].length} items</p>
                                            </div>
                                        </div>

                                        <p className="font-semibold text-slate-700 dark:text-slate-200">
                                            {mealEntries.reduce((sum, e) => sum + e.calories, 0)} kcal
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        {groupedEntries[mealType].map((entry) => (
                                            <div key={entry.documentId || entry.id} className="food-entry-item">
                                                <div className="flex-1">
                                                    <p className="font-medium text-slate-700 dark:text-slate-200">
                                                        {entry.name}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                                                        {entry.calories} kcal
                                                    </span>

                                                    <button type="button" onClick={() => handleDeleteEntry(entry)} className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg cursor-pointer transition-colors">
                                                        <Trash2Icon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FoodLog;

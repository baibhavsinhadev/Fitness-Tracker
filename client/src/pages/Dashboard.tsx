import { useEffect, useState } from "react";
import { getMotivationalMessage } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import { Activity, Dumbbell, Flame, FlameIcon, HamburgerIcon, Ruler, Scale, ScaleIcon, TrendingUp, ZapIcon } from "lucide-react";
import type { ActivityEntry, FoodEntry } from "../types";

import Card from "../components/ui/Card";
import ProgressBar from "../components/ui/ProgressBar";
import CaloriesChart from "../components/CaloriesChart";

const Dashboard = () => {

    const { user, allActivityLogs, allFoodLogs } = useAppContext();
    const [todayFood, setTodayFood] = useState<FoodEntry[]>([]);
    const [todayActivities, setTodayActivities] = useState<ActivityEntry[]>([]);

    const DAILY_CALORIE_LIMIT: number = user?.dailyCalorieIntake || 2000;

    // Load User Data
    const loadUserData = () => {
        const today = new Date().toISOString().split('T')[0];

        const foodData = allFoodLogs.filter((f: FoodEntry) => f.createdAt?.split('T')[0] === today);
        setTodayFood(foodData);

        const activityData = allActivityLogs.filter((a: ActivityEntry) => a.createdAt?.split('T')[0] === today);
        setTodayActivities(activityData);
    }

    useEffect(() => {
        (() => { loadUserData() })();
    }, [allActivityLogs, allFoodLogs]);

    const totalCalories: number = todayFood.reduce((sum, item) => sum + item.calories, 0);
    const totalActiveMinutes: number = todayActivities.reduce((sum, item) => sum + item.duration, 0);
    const totalBurned: number = todayActivities.reduce((sum, item) => sum + (item.calories || 0), 0);

    const remainingCalories: number = DAILY_CALORIE_LIMIT - totalCalories;
    const motivation = getMotivationalMessage(totalCalories, totalActiveMinutes, DAILY_CALORIE_LIMIT)

    const getBmiData = (weight: number, heightCm: number) => {
        const heightM = heightCm / 100;
        const bmiRaw = weight / (heightM * heightM);
        const bmi = Number(bmiRaw.toFixed(1));

        if (bmi < 18.5) {
            return {
                bmi,
                label: "Underweight",
                textColor: "text-blue-600",
                markerColor: "bg-blue-600",
            };
        };

        if (bmi < 25) {
            return {
                bmi,
                label: "Normal",
                textColor: "text-emerald-600",
                markerColor: "bg-emerald-600",
            };
        };

        if (bmi < 30) {
            return {
                bmi,
                label: "Overweight",
                textColor: "text-orange-600",
                markerColor: "bg-orange-600",
            };
        };

        return {
            bmi,
            label: "Obese",
            textColor: "text-red-600",
            markerColor: "bg-red-600",
        };
    };

    const bmiData =
        user?.weight && user?.height
            ? getBmiData(user.weight, user.height)
            : null;

    const getBmiMarkerPosition = (bmi: number) => {
        const min = 14;
        const max = 40;

        const clamped = Math.min(Math.max(bmi, min), max);
        return ((clamped - min) / (max - min)) * 100;
    };

    return (
        <div className="page-container">
            {/* ------------------- Header ------------------- */}
            <div className="dashboard-header">
                <p className="text-emerald-100 text-sm font-medium">Welcome back</p>
                <h1 className="text-2xl font-bold mt-1">{`Hi there! 👏 ${user?.username}`}</h1>

                {/* ------------------- Motivation Card ------------------- */}
                <div className="mt-6 bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">{motivation.emoji}</span>
                        <p className="text-white font-medium">{motivation.text}</p>
                    </div>
                </div>
            </div>

            {/* ------------------- Main Content ------------------- */}
            <div className="dashboard-grid">
                {/* ------------------- Calories Card ------------------- */}
                <Card className="shadow-lg col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                                <HamburgerIcon className="w-6 h-6 text-orange-500" />
                            </div>

                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Calories Consumed</p>
                                <p className="text-2xl font-bold text-slate-800 dark:text-white">{totalCalories}</p>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className="text-sm text-slate-500 dark:text-slate-400">Limit</p>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">{DAILY_CALORIE_LIMIT}</p>
                        </div>
                    </div>

                    <ProgressBar value={totalCalories} max={DAILY_CALORIE_LIMIT} />

                    <div className="mt-4 flex justify-between items-center">
                        <div className={`px-3 py-1.5 rounded-lg ${remainingCalories >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400'}`}>
                            <span className="text-sm font-medium">
                                {remainingCalories >= 0 ? `${remainingCalories} kcal remaining` : `${Math.abs(remainingCalories)} kcal over`}
                            </span>
                        </div>

                        <span className="text-sm text-slate-400">{Math.round((totalCalories / DAILY_CALORIE_LIMIT) * 100)}%</span>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800 my-4" />

                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                                <FlameIcon className="w-6 h-6 text-orange-500" />
                            </div>

                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Calories Burned</p>
                                <p className="text-2xl font-bold text-slate-800 dark:text-white">{totalBurned}</p>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className="text-sm text-slate-500 dark:text-slate-400">Goal</p>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">{user?.dailyCalorieBurn || 400}</p>
                        </div>
                    </div>

                    <ProgressBar value={totalBurned} max={user?.dailyCalorieBurn || 400} />
                </Card>

                {/* ------------------- Stats Row ------------------- */}
                <div className="dashboard-card-grid">
                    {/* ------------------- Active Minutes ------------------- */}
                    <Card>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                <Activity className="w-5 h-5 text-blue-500" />
                            </div>

                            <p className="text-sm text-slate-500 dark:text-white">Active</p>
                        </div>

                        <p className="text-2xl font-bold text-slate-800 dark:text-white">{totalActiveMinutes}</p>
                        <p className="text-sm text-slate-400">minutes today</p>
                    </Card>

                    {/* ------------------- Activities Count ------------------- */}
                    <Card>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                                <ZapIcon className="w-5 h-5 text-purple-500" />
                            </div>

                            <p className="text-sm text-slate-500 dark:text-white">Workouts</p>
                        </div>

                        <p className="text-2xl font-bold text-slate-800 dark:text-white">{todayActivities.length}</p>
                        <p className="text-sm text-slate-400">activities logged</p>
                    </Card>
                </div>

                {/* ------------------- Goal Card ------------------- */}
                {user && (
                    // This card will span both columns on large screens
                    <Card className="bg-linear-to-r from-slate-800 to-slate-700">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-emerald-400" />
                            </div>

                            <div>
                                <p className="text-slate-400 text-sm">Your Goal</p>
                                {user.goal === "lose" && (
                                    <p className="flex items-center gap-2 text-sm text-white font-semibold">
                                        <Flame className="h-5 w-5 text-orange-600" />
                                        <span>Lose Weight</span>
                                    </p>
                                )}

                                {user.goal === "maintain" && (
                                    <p className="flex items-center gap-2 text-sm text-white font-semibold">
                                        <Scale className="h-5 w-5 text-yellow-600" />
                                        <span>Maintain Weight</span>
                                    </p>
                                )}

                                {user.goal === "gain" && (
                                    <p className="flex items-center gap-2 text-sm text-white font-semibold">
                                        <Dumbbell className="h-5 w-5 text-yellow-600" />
                                        <span>Gain Weight</span>
                                    </p>
                                )}
                            </div>
                        </div>
                    </Card>
                )}

                {/* ------------------- Body Metrics Card ------------------- */}
                {user && user.weight && (
                    <Card>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                                <ScaleIcon className="w-6 h-6 text-indigo-500" />
                            </div>

                            <div>
                                <h3 className="font-semibold text-slate-800 dark:text-white">Body Metrics</h3>
                                <p className="text-slate-500 text-sm dark:text-slate-300">Your stats</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                                        <ScaleIcon className="w-4 h-4 text-slate-500" />
                                    </div>

                                    <span className="text-sm text-slate-500 dark:text-slate-400">Weight</span>
                                </div>

                                <span className="font-semibold text-slate-700 dark:text-slate-200">{user.weight} kg</span>
                            </div>

                            {user.height && (
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                                            <Ruler className="w-4 h-4 text-slate-500" />
                                        </div>

                                        <span className="text-sm text-slate-500 dark:text-slate-400">Height</span>
                                    </div>

                                    <span className="font-semibold text-slate-700 dark:text-slate-200">{user.height} cm</span>
                                </div>
                            )}

                            {bmiData && (
                                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                    {/* BMI Number + Status */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                            BMI (Body Mass Index)
                                        </span>

                                        <div className="flex items-center gap-2">
                                            <span className="text-lg font-bold text-slate-800 dark:text-white">
                                                {bmiData.bmi}
                                            </span>

                                            <span className={`text-xs font-semibold ${bmiData.textColor}`}>
                                                {bmiData.label}
                                            </span>
                                        </div>
                                    </div>

                                    {/* BMI Scale Visual */}
                                    <div className="mt-3">
                                        <div className="relative h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                                            <div className="flex-1 bg-blue-400 opacity-30" />
                                            <div className="flex-1 bg-emerald-400 opacity-30" />
                                            <div className="flex-1 bg-orange-400 opacity-30" />
                                            <div className="flex-1 bg-red-400 opacity-30" />

                                            {/* Marker */}
                                            <div className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full ${bmiData.markerColor} border-2 border-white dark:border-slate-900`} style={{ left: `${getBmiMarkerPosition(bmiData.bmi)}%`, transform: "translate(-50%, -50%)" }} />
                                        </div>

                                        {/* Threshold Labels */}
                                        <div className="mt-2 flex justify-between text-[11px] text-slate-400">
                                            <span>18.5</span>
                                            <span>25</span>
                                            <span>30</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                )}

                {/* ------------------- Quick Summary ------------------- */}
                <Card>
                    <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Today's Summary</h3>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-slate-500 dark:text-slate-400">Meals Logged</span>
                            <span className="font-medium text-slate-700 dark:text-slate-200">{todayFood.length}</span>
                        </div>

                        <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-slate-500 dark:text-slate-400">Total Calories</span>
                            <span className="font-medium text-slate-700 dark:text-slate-200">{totalCalories} kcal</span>
                        </div>

                        <div className="flex items-center justify-between py-2">
                            <span className="text-slate-500 dark:text-slate-400">Active time</span>
                            <span className="font-medium text-slate-700 dark:text-slate-200">{totalActiveMinutes} min</span>
                        </div>
                    </div>
                </Card>

                {/* ------------------- Activity & Intake Graph ------------------- */}
                <Card className="col-span-2">
                    <h3 className="font-semibold text-slate-800 dark:text-white mb-2">This Week's Progress</h3>

                    <CaloriesChart />
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;

import { useEffect, useMemo, useState } from "react";
import { CalendarDaysIcon, PersonStandingIcon, ScaleIcon, TargetIcon, LogOutIcon, SaveIcon, XIcon, UserIcon, Loader2Icon } from "lucide-react";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";

import { useAppContext } from "../context/AppContext";
import api from "../configs/api";
import toast from "react-hot-toast";

type GoalType = "gain" | "lose" | "maintain";

const goalOptions = [
    { label: "Gain Muscle", value: "gain" },
    { label: "Lose Weight", value: "lose" },
    { label: "Maintain", value: "maintain" },
];

const Profile = () => {

    const { user, setUser, logout, allFoodLogs, allActivityLogs } = useAppContext();

    const [editMode, setEditMode] = useState(false);
    const [saving, setSaving] = useState(false);
    const [now, setNow] = useState(() => Date.now());

    const [form, setForm] = useState({
        age: "",
        weight: "",
        height: "",
        goal: "" as GoalType | "",
    });

    useEffect(() => {
        if (!user) return;

        setForm({
            age: user.age ? String(user.age) : "",
            weight: user.weight ? String(user.weight) : "",
            height: user.height ? String(user.height) : "",
            goal: (user.goal?.toLowerCase?.() as GoalType) || "",
        });
    }, [user]);

    const foodCount = useMemo(() => allFoodLogs?.length || 0, [allFoodLogs]);
    const activityCount = useMemo(
        () => allActivityLogs?.length || 0,
        [allActivityLogs]
    );

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(Date.now());
        }, 60 * 1000); // every 1 minute

        return () => clearInterval(interval);
    }, []);

    const memberSince = useMemo(() => {
        if (!user?.createdAt) return "—";

        const created = new Date(user.createdAt).getTime();
        const diffMs = now - created;

        const minutes = Math.floor(diffMs / (1000 * 60));
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const years = Math.floor(days / 365);

        if (years >= 1) return `Joined ${years} year${years > 1 ? "s" : ""} ago`;
        if (days >= 1) return `Joined ${days} day${days > 1 ? "s" : ""} ago`;
        if (hours >= 1) return `Joined ${hours} hour${hours > 1 ? "s" : ""} ago`;
        if (minutes >= 1) return `Joined ${minutes} minute${minutes > 1 ? "s" : ""} ago`;

        return "Joined just now";
    }, [user?.createdAt, now]);

    const handleCancel = () => {
        if (!user) return;

        setForm({
            age: user.age ? String(user.age) : "",
            weight: user.weight ? String(user.weight) : "",
            height: user.height ? String(user.height) : "",
            goal: (user.goal?.toLowerCase?.() as GoalType) || "",
        });

        setEditMode(false);
    };

    const handleSave = async (e: React.SyntheticEvent) => {
        e.preventDefault();

        if (!form.age || !form.weight || !form.height || !form.goal) {
            toast.error("All fields are required");
            return;
        }

        const age = Number(form.age);
        const weight = Number(form.weight);
        const height = Number(form.height);

        if (Number.isNaN(age) || age < 1 || age > 120) {
            toast.error("Enter a valid age");
            return;
        }

        if (Number.isNaN(weight) || weight < 1 || weight > 500) {
            toast.error("Enter a valid weight");
            return;
        }

        if (Number.isNaN(height) || height < 50 || height > 250) {
            toast.error("Enter a valid height");
            return;
        }

        try {
            setSaving(true);

            const token = user?.token;
            if (!token) {
                toast.error("Login required");
                return;
            }

            api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

            const { data } = await api.put(`/api/users/${user.id}`, {
                age,
                weight,
                height,
                goal: form.goal,
            });

            setUser((prev) => (prev ? { ...prev, ...data, token } : prev));

            toast.success("Profile updated");
            setEditMode(false);
        } catch (error: any) {
            console.log(error?.response?.data);
            toast.error(error?.response?.data?.error?.message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    if (!user) {
        return (
            <div className="page-container">
                <div className="page-header pt-6!">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Profile</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                            Manage your settings
                        </p>
                    </div>
                </div>

                <Card>
                    <p className="text-slate-600 dark:text-slate-300">You are not logged in.</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="page-container">
            {/* ---------------- Header ---------------- */}
            <div className="page-header pt-6!">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Profile</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                    Manage your settings
                </p>
            </div>

            {/* ---------------- Grid Row ---------------- */}
            <div className="page-content-grid">
                <Card>
                    {/* Top header inside card */}
                    <div className="flex items-start gap-4 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center">
                            <UserIcon className="size-6 text-white" />
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                                Your Profile
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{memberSince}</p>
                        </div>
                    </div>

                    {/* ---------------- VIEW MODE ---------------- */}
                    {!editMode && (
                        <div className="space-y-3">
                            {/* Age */}
                            <div className="bg-slate-100 dark:bg-slate-800/60 rounded-2xl p-4 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                                    <CalendarDaysIcon className="size-5 text-slate-700 dark:text-slate-300" />
                                </div>

                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Age</p>
                                    <p className="text-slate-800 dark:text-white font-semibold">
                                        {user.age ? `${user.age} years` : "—"}
                                    </p>
                                </div>
                            </div>

                            {/* Weight */}
                            <div className="bg-slate-100 dark:bg-slate-800/60 rounded-2xl p-4 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                                    <ScaleIcon className="size-5 text-slate-700 dark:text-slate-300" />
                                </div>

                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Weight</p>
                                    <p className="text-slate-800 dark:text-white font-semibold">
                                        {user.weight ? `${user.weight} kg` : "—"}
                                    </p>
                                </div>
                            </div>

                            {/* Height */}
                            <div className="bg-slate-100 dark:bg-slate-800/60 rounded-2xl p-4 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                                    <PersonStandingIcon className="size-5 text-slate-700 dark:text-slate-300" />
                                </div>

                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Height</p>
                                    <p className="text-slate-800 dark:text-white font-semibold">
                                        {user.height ? `${user.height} cm` : "—"}
                                    </p>
                                </div>
                            </div>

                            {/* Goal */}
                            <div className="bg-slate-100 dark:bg-slate-800/60 rounded-2xl p-4 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                                    <TargetIcon className="size-5 text-slate-700 dark:text-slate-300" />
                                </div>

                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Goal</p>
                                    <p className="text-slate-800 dark:text-white font-semibold capitalize">
                                        {user.goal || "—"}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-3">
                                <Button className="w-full" type="button" onClick={() => setEditMode(true)}>
                                    Edit Profile
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* ---------------- EDIT MODE ---------------- */}
                    {editMode && (
                        <form onSubmit={handleSave} className="space-y-4">
                            <Input label="Age" value={form.age} onChange={(v) => setForm((p) => ({ ...p, age: v.toString() }))} placeholder="16" type="number" min={1} className="no-spinner" />

                            <Input label="Weight (kg)" value={form.weight} onChange={(v) => setForm((p) => ({ ...p, weight: v.toString() }))} placeholder="42" className="no-spinner" type="number" min={1} />

                            <Input label="Height (cm)" value={form.height} onChange={(v) => setForm((p) => ({ ...p, height: v.toString() }))} placeholder="155" type="number" min={100} className="no-spinner" />

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Fitness Goal <span className="text-red-500 ml-1">*</span>
                                </label>

                                <Select
                                    required
                                    value={form.goal}
                                    onChange={(v) => setForm((p) => ({ ...p, goal: v.toString() as GoalType }))}
                                    options={goalOptions}
                                    placeholder="Select goal"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button className="flex-1" variant="secondary" type="button" onClick={handleCancel} disabled={saving}>
                                    <XIcon className="size-5" />
                                    Cancel
                                </Button>

                                <Button className="flex-1" type="submit" disabled={saving}>
                                    {saving ? (
                                        <>
                                            <Loader2Icon className="size-5 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <SaveIcon className="size-5" />
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    )}
                </Card>

                {/* ---------------- Right Column ---------------- */}
                <div className="space-y-4">
                    <Card>
                        <h3 className="font-semibold text-slate-800 dark:text-white mb-3">
                            Your Stats
                        </h3>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-100 dark:bg-slate-800/60 rounded-2xl p-5 text-center">
                                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                                    {foodCount}
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    Food entries
                                </p>
                            </div>

                            <div className="bg-slate-100 dark:bg-slate-800/60 rounded-2xl p-5 text-center">
                                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                                    {activityCount}
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    Activities
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Button className="w-full border border-red-300" variant="danger" type="button" onClick={logout}>
                        <LogOutIcon className="size-5" />
                        Logout
                    </Button>
                </div>
            </div>
        </div >
    );
};

export default Profile;

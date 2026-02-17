import toast from "react-hot-toast";
import Button from "./ui/Button";

const confirmToast = (message: string) => {
    return new Promise<boolean>((resolve) => {
        toast.custom((t) => (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-2xl p-4 w-[320px]">
                <p className="text-slate-800 dark:text-white font-medium">
                    {message}
                </p>

                <div className="flex gap-2 mt-4">
                    <Button
                        variant="secondary"
                        className="w-full hover:bg"
                        onClick={() => {
                            toast.dismiss(t.id);
                            resolve(false);
                        }}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="danger"
                        className="w-full bg-red-800! hover:bg-red-500! text-white!"
                        onClick={() => {
                            toast.dismiss(t.id);
                            resolve(true);
                        }}
                    >
                        Delete
                    </Button>
                </div>
            </div>
        ));
    });
};

export default confirmToast
import { AtSignIcon, EyeIcon, EyeOff, LockIcon, MailIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

const Login = () => {

    const navigate = useNavigate();
    const { login, signup, user } = useAppContext();

    const [state, setState] = useState<'login' | 'signup'>('signup');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (state === 'login') {
            await login({ email, password });
        } else {
            await signup({ username, email, password });
        };

        setIsSubmitting(false);
    };

    useEffect(() => {
        if (user) {
            navigate('/');
        };
    }, [user, navigate]);

    return (
        <>
            <main className="login-page-container">
                <form onSubmit={handleSubmit} className="login-form">
                    <h2 className="text-3xl font-medium text-gray-900 dark:text-white">
                        {state === 'login' ? 'Sign In' : 'Sign Up'}
                    </h2>

                    <p className="mt-2 text-sm text-gray-500/90 dark:text-gray-400">
                        {state === 'login' ? 'Please enter email and password to access.' : 'Please enter your details to create an account.'}
                    </p>

                    {/* ----------------- Username ----------------- */}
                    {state === 'signup' && (
                        <div className="mt-4">
                            <label className="font-medium text-sm text-gray-700 dark:text-gray-300">Username</label>
                            <div className="relative mt-2">
                                <AtSignIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4.5" />

                                <input onChange={(e) => setUsername(e.target.value)} value={username} type="text" placeholder="enter a username" className="login-input" required />
                            </div>
                        </div>
                    )}

                    {/* ----------------- Email ----------------- */}
                    <div className="mt-4">
                        <label className="font-medium text-sm text-gray-700 dark:text-gray-300">Email Address</label>
                        <div className="relative mt-2">
                            <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4.5" />

                            <input onChange={(e) => setEmail(e.target.value)} value={email} type="email" placeholder="enter your email" className="login-input" required />
                        </div>
                    </div>

                    {/* ----------------- Email ----------------- */}
                    <div className="mt-4">
                        <label className="font-medium text-sm text-gray-700 dark:text-gray-300">Password</label>
                        <div className="relative mt-2">
                            <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4.5" />

                            <input onChange={(e) => setPassword(e.target.value)} value={password} type={showPassword ? 'text' : 'password'} placeholder="enter your password" className="login-input" required />

                            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff size={16} /> : <EyeIcon size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* ----------------- Submit Button ----------------- */}
                    <button type="submit" disabled={isSubmitting} className="login-button disabled:cursor-not-allowed">
                        {isSubmitting ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                Signing in...
                            </span>
                        ) : state === 'login' ? 'Login' : 'Sign up'}
                    </button>

                    {/* ----------------- State Changer ----------------- */}
                    {state === 'login' ? (
                        <p className="text-center py-6 text-sm text-gray-50 dark:text-gray-400">Don't have an account? <button className="ml-1 cursor-pointer text-green-600 hover:underline" onClick={() => setState('signup')}>Sign up</button></p>
                    ) : (
                        <p className="text-center py-6 text-sm text-gray-50 dark:text-gray-400">Already have an account? <button className="ml-1 cursor-pointer text-green-600 hover:underline" onClick={() => setState('login')}>Login</button></p>
                    )}
                </form>
            </main>
        </>
    );
};

export default Login;

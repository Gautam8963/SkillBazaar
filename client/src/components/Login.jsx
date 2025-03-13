import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { login, setAvatar, setToken, setUserId, tokenExists, setUserRole } from "../Redux/UserSlice";
import { FiEye, FiEyeOff, FiUser, FiLock, FiArrowRight } from "react-icons/fi";
import signin from '../assets/svgs/signin.svg';
import SpecialFooter from "./SpecialFooter";
import Loading from './Loading';

export default function Login() {
    const username = useRef();
    const password = useRef();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formErrors, setFormErrors] = useState({ username: '', password: '' });
    const [touched, setTouched] = useState({ username: false, password: false });
    
    const { token } = useSelector(state => state.user);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        tokenExists(token, navigate, dispatch).then(() => {
            if (localStorage.getItem('userInfo')) {
                const connectedUser = JSON.parse(localStorage.getItem('userInfo'));
                const route = connectedUser.role === "client" ? "client" : "freelancer";
                navigate(`/dashboard/${route}/${connectedUser._id}`);
            }
        });
    }, []);

    const validateField = (name, value) => {
        let error = '';
        
        switch (name) {
            case 'username':
                if (!value.trim()) {
                    error = 'Username is required';
                } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
                    error = 'Username must only contain letters, numbers, and underscores';
                }
                break;
            case 'password':
                if (!value) {
                    error = 'Password is required';
                } else if (value.length < 8) {
                    error = 'Password must be at least 8 characters';
                }
                break;
            default:
                break;
        }
        
        return error;
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched({ ...touched, [name]: true });
        setFormErrors({ ...formErrors, [name]: validateField(name, value) });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (touched[name]) {
            setFormErrors({ ...formErrors, [name]: validateField(name, value) });
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validate all fields
        const usernameValue = username.current.value;
        const passwordValue = password.current.value;
        
        const usernameError = validateField('username', usernameValue);
        const passwordError = validateField('password', passwordValue);
        
        setFormErrors({ username: usernameError, password: passwordError });
        setTouched({ username: true, password: true });
        
        if (usernameError || passwordError) {
            return;
        }

        setLoading(true);
        const body = { username: usernameValue, password: passwordValue };
        
        dispatch(login(body))
            .unwrap()
            .then(data => {
                setTimeout(() => {
                    setLoading(false);
                    if (data.status === 200) {
                        toast.success(data.msg);
                        localStorage.setItem('token', data.token);
                        localStorage.setItem('userInfo', JSON.stringify(data.userInfo));

                        dispatch(setUserId(data.userInfo._id));
                        dispatch(setToken(data.token));
                        dispatch(setAvatar(data.userInfo.image));
                        dispatch(setUserRole(data.userInfo.role));

                        const route = data.userInfo.role === "client" ? "client" : "freelancer";
                        navigate(`/dashboard/${route}/${data.userInfo._id}`);
                    } else {
                        toast.error(data.msg);
                    }
                }, 1000);
            })
            .catch((error) => {
                setTimeout(() => {
                    setLoading(false);
                    toast.error(error.toString());
                }, 1000);
            });
    };

    return (
        <>
            {loading && <Loading />}
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                        {/* Left side - Image */}
                        <div className="md:w-1/2 bg-indigo-600 flex items-center justify-center p-12 hidden md:block">
                            <div className="max-w-sm">
                                <img src={signin} alt="Sign In" className="w-full h-auto" />
                                <div className="mt-8 text-center">
                                    <h2 className="text-white text-3xl font-bold">Welcome Back!</h2>
                                    <p className="text-indigo-200 mt-3">Sign in to access your account and continue your journey with us.</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Right side - Form */}
                        <div className="md:w-1/2 py-12 px-8 md:px-12">
                            <div className="text-center md:text-left">
                                <h1 className="text-3xl font-bold text-gray-800">Sign In</h1>
                                <p className="mt-2 text-gray-600">Please enter your credentials to continue</p>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                                <div>
                                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                        Username
                                    </label>
                                    <div className="mt-1 relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FiUser className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            ref={username}
                                            id="username"
                                            name="username"
                                            type="text"
                                            autoComplete="username"
                                            placeholder="Enter your username"
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            className={`block w-full pl-10 pr-3 py-3 border ${formErrors.username && touched.username ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                                        />
                                    </div>
                                    {formErrors.username && touched.username && (
                                        <p className="mt-1 text-sm text-red-600">{formErrors.username}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                        Password
                                    </label>
                                    <div className="mt-1 relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FiLock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            ref={password}
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            autoComplete="current-password"
                                            placeholder="Enter your password"
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            className={`block w-full pl-10 pr-10 py-3 border ${formErrors.password && touched.password ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                            <button
                                                type="button"
                                                onClick={togglePasswordVisibility}
                                                className="text-gray-400 hover:text-gray-500 focus:outline-none"
                                            >
                                                {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                    </div>
                                    {formErrors.password && touched.password && (
                                        <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                                    )}
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <input
                                            id="remember-me"
                                            name="remember-me"
                                            type="checkbox"
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                            Remember me
                                        </label>
                                    </div>

                                    <div className="text-sm">
                                        <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                                            Forgot your password?
                                        </a>
                                    </div>
                                </div>

                                <div>
                                    <button
                                        type="submit"
                                        className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out"
                                    >
                                        <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                            <FiArrowRight className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" />
                                        </span>
                                        Sign in
                                    </button>
                                </div>
                            </form>

                            <div className="mt-6 text-center">
                                <p className="text-sm text-gray-600">
                                    Not a member?{' '}
                                    <a href="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
                                        Sign up now
                                    </a>
                                </p>
                            </div>
                            
                            <div className="mt-8 border-t border-gray-200 pt-6">
                                <div className="flex items-center justify-center">
                                    <span className="text-sm text-gray-500">
                                        By signing in, you agree to our{' '}
                                        <a href="#" className="text-indigo-600 hover:text-indigo-500">
                                            Terms
                                        </a>{' '}
                                        and{' '}
                                        <a href="#" className="text-indigo-600 hover:text-indigo-500">
                                            Privacy Policy
                                        </a>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <SpecialFooter />
                <ToastContainer position="top-right" autoClose={5000} />
            </div>
        </>
    );
}
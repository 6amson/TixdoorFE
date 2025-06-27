'use client';
import { useState } from 'react';
import Link from 'next/link';
import styles from './auth.module.scss';
import { useAuth } from '@/context/AuthContext';

interface AuthFormProps {
    type: 'signin' | 'signup';
}

const AuthForm = ({ type }: AuthFormProps) => {
    const { signin, signup } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        adminCode: ''
    });

    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (isSignUp) {
            try {
               await signup(formData.email, formData.password, formData.adminCode);
                setIsLoading(false);
            } catch (error) {
                throw error;
                setIsLoading(false);
            }
        }

        if (!isSignUp) {
            try {
                await signin(formData.email, formData.password);

                setIsLoading(false);
            } catch (error) {
                throw error;
                setIsLoading(false);
            }
        }
    };

    const isSignUp = type === 'signup';

    return (
        <div className={styles.container}>
            <div className={styles.formWrapper}>
                <div className={styles.header}>
                    <Link href="/" className={styles.logo}>
                        Tixdoor
                    </Link>
                    <h1 className={styles.title}>
                        {isSignUp ? 'Create Account' : 'Welcome Back'}
                    </h1>
                    <p className={styles.subtitle}>
                        {isSignUp
                            ? 'Join Tixdoor and start your journey'
                            : 'Sign in to your account to continue'
                        }
                    </p>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="email" className={styles.label}>
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={styles.input}
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="password" className={styles.label}>
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={styles.input}
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    {isSignUp && (
                        <div className={styles.inputGroup}>
                            <label htmlFor="adminCode" className={styles.label}>
                                Admin Code (For Admins Only)
                            </label>
                            <input
                                type="text"
                                id="adminCode"
                                name="adminCode"
                                value={formData.adminCode}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder="Enter admin code"
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className={styles.loader}></span>
                        ) : (
                            isSignUp ? 'Create Account' : 'Sign In'
                        )}
                    </button>
                </form>

                <div className={styles.footer}>
                    <p>
                        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                        <Link
                            href={isSignUp ? '/signin' : '/signup'}
                            className={styles.link}
                        >
                            {isSignUp ? 'Sign In' : 'Sign Up'}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthForm;
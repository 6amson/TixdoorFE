'use client';
import { useState } from 'react';
import Link from 'next/link';
import styles from './header.module.scss';
import { usePathname } from "next/navigation";
import { useAuth } from '@/context/AuthContext';

const Header = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { signout, downloadCSV, user } = useAuth();
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const isProfilePage = pathname.startsWith("/dashboard");

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <span>Tixdoor</span>
        </Link>

        {/* Desktop Navigation */}
        {!isProfilePage && (
          <nav className={styles.desktopNav}>
            <Link href="/signin" className={styles.signInBtn}>
              Sign In
            </Link>
            <Link href="/signup" className={styles.signUpBtn}>
              Sign Up
            </Link>
          </nav>
        )}
        {isProfilePage && (
          <nav className={styles.desktopNav}>
            <Link onClick={() => downloadCSV()} href="#" className={styles.signInBtn}>
              Download CSV
            </Link>
            <Link href="#" onClick={signout} className={styles.signUpBtn}>
              Sign Out
            </Link>
          </nav>
        )}
        {/* Mobile Hamburger */}
        <button
          className={styles.hamburger}
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          <span className={`${styles.line} ${isMobileMenuOpen ? styles.active : ''}`}></span>
          <span className={`${styles.line} ${isMobileMenuOpen ? styles.active : ''}`}></span>
          <span className={`${styles.line} ${isMobileMenuOpen ? styles.active : ''}`}></span>
        </button>

        {/* Mobile Menu */}
        {!isProfilePage && (<div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.open : ''}`}>
          <Link
            href="/signin"
            className={styles.mobileSignIn}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className={styles.mobileSignUp}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Sign Up
          </Link>
        </div>)}

        {isProfilePage && (
          <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.open : ''}`}>
            {user?.user_type == "admin" && (
            <Link href="#"
            onClick={() => { downloadCSV(); setIsMobileMenuOpen(false); }}
             className={styles.mobileSignIn}>
              Download CSV
            </Link>)}
            <Link
              href="#"
              onClick={() => { signout(); setIsMobileMenuOpen(false); }}
              className={styles.mobileSignUp}
            >
              Sign Up
            </Link>
          </div>)}
      </div>
    </header>
  );
};

export default Header;
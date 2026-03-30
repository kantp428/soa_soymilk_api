'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Store, MonitorSmartphone, LayoutDashboard, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getStaff } from '@/features/admin/api';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: 'easeOut' },
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const Bean = ({ className, delay = 0 }: { className?: string; delay?: number }) => (
  <motion.div
    initial={{ y: 0, rotate: 0 }}
    animate={{
      y: [0, -20, 0],
      rotate: [0, 10, -10, 0],
    }}
    transition={{
      duration: 5,
      repeat: Infinity,
      ease: 'easeInOut',
      delay,
    }}
    className={`absolute h-4 w-4 rounded-full bg-zinc-300/40 blur-[1px] ${className}`}
  />
);

const STAFF_ID_COOKIE = 'pos_staff_id';
const STAFF_NAME_COOKIE = 'pos_staff_name';
const STAFF_PHONE_COOKIE = 'pos_staff_phone';
const STAFF_ROLE_COOKIE = 'pos_staff_role';

const getCookieValue = (name: string) => {
  if (typeof document === 'undefined') return '';

  const cookie = document.cookie
    .split('; ')
    .find((item) => item.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.split('=').slice(1).join('=')) : '';
};

const setSessionCookie = (name: string, value: string) => {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=86400; SameSite=Lax`;
};

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [staffIdInput, setStaffIdInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (searchParams.get('posLogin') !== '1') {
      return;
    }

    if (getCookieValue(STAFF_ID_COOKIE)) {
      router.replace('/pos');
      return;
    }

    setLoginError('');
    setPasswordInput('');
    setIsLoginOpen(true);
    router.replace('/');
  }, [router, searchParams]);

  const handleOpenPosLogin = () => {
    if (getCookieValue(STAFF_ID_COOKIE)) {
      router.push('/pos');
      return;
    }

    setLoginError('');
    setPasswordInput('');
    setIsLoginOpen(true);
  };

  const handleLoginToPos = async () => {
    if (!staffIdInput.trim()) {
      setLoginError('Please enter staff ID');
      return;
    }

    if (passwordInput !== '1234') {
      setLoginError('Password must be 1234');
      return;
    }

    try {
      setIsLoggingIn(true);
      setLoginError('');

      const staff = await getStaff(staffIdInput) as unknown as {
        staff_id: number;
        staff_name: string;
        phone: string;
        role?: string;
        status?: string;
      };

      if (!staff?.staff_id || !staff.staff_name || !staff.phone) {
        setLoginError('Staff record not found');
        return;
      }

      if (staff.status && staff.status.toUpperCase() !== 'ACTIVE') {
        setLoginError('This staff account is inactive');
        return;
      }

      setSessionCookie(STAFF_ID_COOKIE, String(staff.staff_id));
      setSessionCookie(STAFF_NAME_COOKIE, staff.staff_name);
      setSessionCookie(STAFF_PHONE_COOKIE, staff.phone);
      setSessionCookie(STAFF_ROLE_COOKIE, staff.role || '');

      setIsLoginOpen(false);
      router.push('/pos');
    } catch (error) {
      console.error('POS staff login failed', error);
      setLoginError('Unable to load staff profile');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <>
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white font-sans selection:bg-zinc-900 selection:text-white">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          className="absolute left-[-10%] top-[-20%] h-[60%] w-[60%] rounded-full bg-gradient-to-br from-zinc-200/70 via-zinc-100/40 to-transparent blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, -40, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          className="absolute bottom-[-20%] right-[-10%] h-[70%] w-[70%] rounded-full bg-gradient-to-tl from-zinc-300/40 via-zinc-100/10 to-transparent blur-3xl"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.85),rgba(255,255,255,0.96)_42%,rgba(244,244,245,0.98)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(24,24,27,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(24,24,27,0.04)_1px,transparent_1px)] bg-[size:32px_32px]" />

        <Bean className="left-1/4 top-1/4" delay={0} />
        <Bean className="right-1/4 top-1/3" delay={1} />
        <Bean className="bottom-1/4 left-1/3" delay={2} />
        <Bean className="right-1/3 top-3/4" delay={1.5} />

        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="z-10 flex w-full max-w-5xl flex-col items-center px-6 text-center"
        >
          <motion.div
            variants={fadeInUp}
            whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
            className="mb-8 flex h-20 w-20 cursor-help items-center justify-center rounded-[28px] border border-zinc-200 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)]"
          >
            <Store className="h-10 w-10 text-zinc-900" />
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="mb-5 text-5xl font-black leading-[0.95] tracking-[-0.04em] text-zinc-950 md:text-7xl"
          >
            <span className="bg-gradient-to-r from-black via-zinc-800 to-zinc-500 bg-clip-text text-transparent">
              Soy Milk Store Dashboard
            </span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="mb-14 max-w-2xl text-lg font-medium leading-relaxed text-zinc-600 md:text-xl"
          >
            Point of sale for the front counter and a full admin area for inventory, reporting, and operations.
          </motion.p>

          <motion.div variants={fadeInUp} className="grid w-full max-w-3xl grid-cols-1 gap-6 md:grid-cols-2">
            <button type="button" onClick={handleOpenPosLogin} className="group text-left">
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative flex h-full min-h-[320px] flex-col items-start overflow-hidden rounded-[34px] border border-zinc-200 bg-white p-8 shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all duration-300 hover:border-zinc-900 hover:shadow-[0_26px_70px_rgba(0,0,0,0.14)]"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-zinc-950" />
                <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-100 transition-colors duration-300 group-hover:bg-zinc-900 group-hover:text-white">
                  <MonitorSmartphone className="h-6 w-6" />
                </div>
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-zinc-500">Front Counter</p>
                <h2 className="mb-3 text-3xl font-black tracking-[-0.03em] text-zinc-950">POS Counter</h2>
                <p className="text-left font-medium leading-7 text-zinc-600">
                  Use this for cashier operations, selecting menu items, adding toppings, and accepting payment.
                </p>
                <div className="mt-auto flex items-center pt-10 text-sm font-bold uppercase tracking-[0.18em] text-zinc-900 transition-transform group-hover:translate-x-2">
                  Open POS <ArrowRight className="ml-2 h-5 w-5" />
                </div>
              </motion.div>
            </button>

            <Link href="/admin" className="group">
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative flex h-full min-h-[320px] flex-col items-start overflow-hidden rounded-[34px] border border-zinc-900 bg-zinc-950 p-8 shadow-[0_22px_60px_rgba(0,0,0,0.16)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_80px_rgba(0,0,0,0.22)]"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-white/80" />
                <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-900 transition-colors duration-300 group-hover:bg-white group-hover:text-zinc-900">
                  <LayoutDashboard className="h-6 w-6" />
                </div>
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-zinc-500">Operations</p>
                <h2 className="mb-3 text-3xl font-black tracking-[-0.03em] text-white">Admin Panel</h2>
                <p className="text-left font-medium leading-7 text-zinc-400">
                  Use this area for stock control, promotions, suppliers, staff data, and business reporting.
                </p>
                <div className="mt-auto flex items-center pt-10 text-sm font-bold uppercase tracking-[0.18em] text-white transition-transform group-hover:translate-x-2">
                  Open Admin <ArrowRight className="ml-2 h-5 w-5" />
                </div>
                <div className="absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-white/5" />
              </motion.div>
            </Link>
          </motion.div>

          <motion.div variants={fadeInUp} className="mt-16 flex flex-wrap justify-center gap-6 text-sm text-zinc-500">
            <div className="mt-8 flex flex-col gap-4 rounded-[28px] border border-zinc-200 bg-white/90 px-8 py-6 text-zinc-700 shadow-[0_16px_40px_rgba(0,0,0,0.05)]">
              <div className="flex items-center"><CheckCircle2 className="mr-2 h-4 w-4 text-zinc-950" /> Built for daily counter operations</div>
              <div className="flex items-center"><CheckCircle2 className="mr-2 h-4 w-4 text-zinc-950" /> Live API integration</div>
              <div className="flex items-center"><CheckCircle2 className="mr-2 h-4 w-4 text-zinc-950" /> Production-ready workflow</div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogContent
          className="sm:max-w-md border-zinc-200 bg-white p-0 shadow-[0_30px_80px_rgba(0,0,0,0.18)]"
          onEscapeKeyDown={() => router.push('/')}
          onPointerDownOutside={(event) => {
            event.preventDefault();
          }}
        >
          <div className="space-y-5 px-6 py-6">
            <DialogHeader className="space-y-0 text-left">
              <DialogTitle className="text-2xl font-black tracking-[-0.03em] text-zinc-950">Login</DialogTitle>
            </DialogHeader>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-[0.24em] text-zinc-500">Staff ID</label>
              <Input
                value={staffIdInput}
                onChange={(e) => setStaffIdInput(e.target.value)}
                placeholder="Enter staff ID"
                disabled={isLoggingIn}
                className="h-12 rounded-2xl border-zinc-200 bg-zinc-50 text-base shadow-none focus-visible:ring-zinc-950"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-[0.24em] text-zinc-500">Password</label>
              <Input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="1234"
                disabled={isLoggingIn}
                className="h-12 rounded-2xl border-zinc-200 bg-zinc-50 text-base shadow-none focus-visible:ring-zinc-950"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    void handleLoginToPos();
                  }
                }}
              />
            </div>

            {loginError ? (
              <div className="rounded-2xl border border-zinc-300 bg-zinc-100 px-4 py-3 text-sm font-medium text-zinc-700">
                {loginError}
              </div>
            ) : null}
          </div>

          <DialogFooter className="border-t border-zinc-200 bg-zinc-50 px-6 py-5">
            <Button
              onClick={() => void handleLoginToPos()}
              disabled={isLoggingIn}
              className="h-12 w-full rounded-2xl bg-zinc-950 text-base font-bold hover:bg-zinc-800"
            >
              {isLoggingIn ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isLoggingIn ? 'Checking staff...' : 'Enter POS'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

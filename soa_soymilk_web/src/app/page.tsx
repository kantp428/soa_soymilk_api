'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Store, MonitorSmartphone, LayoutDashboard, ArrowRight, CheckCircle2 } from 'lucide-react';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: "easeOut" }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const Bean = ({ className, delay = 0 }: { className?: string, delay?: number }) => (
  <motion.div
    initial={{ y: 0, rotate: 0 }}
    animate={{
      y: [0, -20, 0],
      rotate: [0, 10, -10, 0]
    }}
    transition={{
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut",
      delay
    }}
    className={`absolute w-4 h-4 rounded-full bg-yellow-200/40 blur-[1px] ${className}`}
  />
);

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center relative overflow-hidden font-sans selection:bg-zinc-200 selection:text-zinc-900">
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          x: [0, 30, 0],
          y: [0, -20, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-yellow-100/40 via-orange-100/20 to-transparent blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, -40, 0],
          y: [0, 30, 0]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-gradient-to-tl from-zinc-200/50 via-zinc-100/20 to-transparent blur-3xl"
      />

      <Bean className="top-1/4 left-1/4" delay={0} />
      <Bean className="top-1/3 right-1/4" delay={1} />
      <Bean className="bottom-1/4 left-1/3" delay={2} />
      <Bean className="top-3/4 right-1/3" delay={1.5} />

      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="z-10 text-center max-w-4xl px-6 w-full flex flex-col items-center"
      >
        <motion.div
          variants={fadeInUp}
          whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
          className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-8 border border-zinc-100 cursor-help"
        >
          <Store className="w-10 h-10 text-zinc-900" />
        </motion.div>

        <motion.h1
          variants={fadeInUp}
          className="text-5xl md:text-7xl font-black tracking-tight text-zinc-900 mb-6 drop-shadow-sm leading-tight"
        >
          <span className="bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-500 bg-clip-text text-transparent">ร้านน้ำเต้าหู้ ตั้งหวังเจ๊ง</span>
        </motion.h1>

        <motion.p
          variants={fadeInUp}
          className="text-lg md:text-xl text-zinc-500 mb-12 max-w-2xl font-medium leading-relaxed"
        >
          ระบบที่ครอบคลุมตั้งแต่การขายหน้าร้าน (POS) ไปจนถึงการจัดการสต็อกและพนักงานหลังบ้าน เชื่อมต่อ API โดยตรงแบบเรียลไทม์
        </motion.p>

        <motion.div
          variants={fadeInUp}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl"
        >
          <Link href="/pos" className="group">
            <motion.div
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white p-8 rounded-[2rem] shadow-sm hover:shadow-2xl transition-all duration-300 border border-zinc-100 flex flex-col items-start relative overflow-hidden h-full"
            >
              <div className="w-12 h-12 bg-zinc-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-zinc-900 group-hover:text-white transition-colors duration-300">
                <MonitorSmartphone className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 mb-2">POS หน้าร้าน</h2>
              <p className="text-zinc-500 text-left font-medium">สำหรับพนักงานแคชเชียร์ จัดการเมนู เลือกท็อปปิ้ง และรับชำระเงิน</p>
              <div className="mt-auto pt-8 flex items-center text-zinc-900 font-bold group-hover:translate-x-2 transition-transform">
                เปิดระบบหน้าร้าน <ArrowRight className="w-5 h-5 ml-2" />
              </div>
            </motion.div>
          </Link>

          <Link href="/admin" className="group">
            <motion.div
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-zinc-900 p-8 rounded-[2rem] shadow-lg hover:shadow-2xl transition-all duration-300 border border-zinc-800 flex flex-col items-start relative overflow-hidden h-full"
            >
              <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white group-hover:text-zinc-900 transition-colors duration-300">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">ระบบหลังหน้า</h2>
              <p className="text-zinc-400 text-left font-medium">สำหรับผู้จัดการและแอดมิน จัดการสต็อก โปรโมชั่น ซัพพลายเออร์ สรุปยอดขาย</p>
              <div className="mt-auto pt-8 flex items-center text-white font-bold group-hover:translate-x-2 transition-transform">
                เข้าสู่แผงควบคุมหลัก <ArrowRight className="w-5 h-5 ml-2" />
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full" />
            </motion.div>
          </Link>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          className="mt-20 flex flex-wrap justify-center gap-6 text-zinc-500 text-sm font-medium"
        >
          <div className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> รองรับข้อมูลปริมาณมาก</div>
          <div className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> ระบบเชื่อมโยงข้อมูลแบบเรียลไทม์</div>
          <div className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> ทำงานได้เต็มประสิทธิภาพ (Production-Grade)</div>
        </motion.div>
      </motion.div>
    </div>
  );
}

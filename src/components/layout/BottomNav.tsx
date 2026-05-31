import { NavLink } from 'react-router-dom';
import { Home, BarChart3, WalletCards, User, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useState } from 'react';
import TransactionModal from '../transactions/TransactionModal';

export default function BottomNav() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navItems = [
    { to: "/dashboard", icon: Home, label: "Home" },
    { to: "/reports", icon: BarChart3, label: "Laporan" },
    // center is the FAB button
    { to: "/accounts", icon: WalletCards, label: "Aset" },
    { to: "/settings", icon: User, label: "Profil" },
  ];

  return (
    <>
      <div className="relative pt-1 flex justify-center w-full">
        <div className="bg-[#1A2634] rounded-t-[32px] px-6 pb-4 pt-2 flex items-center justify-between w-full shadow-[0_-10px_40px_rgba(0,0,0,0.3)] border-t border-white/5 relative">
          {/* Left 2 items */}
          {navItems.slice(0, 2).map((item) => (
            <NavLink 
              key={item.to}
              to={item.to}
              className={({ isActive }) => cn(
                "relative flex flex-col items-center justify-center w-[52px] h-[52px] rounded-full transition-all duration-300",
                isActive ? "text-[var(--color-stabilo)]" : "text-slate-500"
              )}
            >
              {({ isActive }) => (
                <>
                  <item.icon className={cn("w-5 h-5", isActive ? "stroke-[2.5px]" : "stroke-[1.5px]")} />
                  <span className="text-[9px] mt-0.5 font-medium">{item.label}</span>
                  {isActive && <div className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-[var(--color-stabilo)]" />}
                </>
              )}
            </NavLink>
          ))}

          {/* Center FAB */}
          <div className="relative -mt-10">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-14 h-14 bg-[var(--color-stabilo)] rounded-full flex items-center justify-center text-black shadow-[0_4px_20px_rgba(204,255,0,0.4)] hover:scale-105 active:scale-95 transition-all border-4 border-[#111A24]"
            >
              <Plus className="w-7 h-7 stroke-[2.5px]" />
            </button>
          </div>

          {/* Right 2 items */}
          {navItems.slice(2).map((item) => (
            <NavLink 
              key={item.to}
              to={item.to}
              className={({ isActive }) => cn(
                "relative flex flex-col items-center justify-center w-[52px] h-[52px] rounded-full transition-all duration-300",
                isActive ? "text-[var(--color-stabilo)]" : "text-slate-500"
              )}
            >
              {({ isActive }) => (
                <>
                  <item.icon className={cn("w-5 h-5", isActive ? "stroke-[2.5px]" : "stroke-[1.5px]")} />
                  <span className="text-[9px] mt-0.5 font-medium">{item.label}</span>
                  {isActive && <div className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-[var(--color-stabilo)]" />}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>

      <TransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onRefresh={() => window.location.reload()} />
    </>
  );
}

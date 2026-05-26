import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export const useInactivityTimeout = (timeoutMs = 300000) => { // 5 minutes
const router = useRouter();

useEffect(() => {
let timeoutId: NodeJS.Timeout;

const resetTimer = () => {
clearTimeout(timeoutId);
timeoutId = setTimeout(async () => {
await supabase.auth.signOut();
localStorage.clear();
alert("⏰ Session timed out due to inactivity (5 minutes).");
router.push('/login');
}, timeoutMs);
};

const events = ['mousemove', 'mousedown', 'keypress', 'touchstart', 'scroll'];
events.forEach(event => document.addEventListener(event, resetTimer));

resetTimer();

return () => {
clearTimeout(timeoutId);
events.forEach(event => document.removeEventListener(event, resetTimer));
};
}, [router, timeoutMs]);
};
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/scrape', icon: '🔍', label: 'Scrape Leads' },
    { href: '/orders', icon: '📁', label: 'Orders' },
    { href: '/config', icon: '⚙️', label: 'Config' },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>S</div>
      
      <nav className={styles.nav}>
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
              title={item.label}
            >
              {item.icon}
            </Link>
          );
        })}
      </nav>

      <div className={styles.user}>
        {/* Mock user avatar */}
        <div style={{ width: '100%', height: '100%', backgroundColor: '#555' }} />
      </div>
    </aside>
  );
}

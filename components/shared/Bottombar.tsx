'use client'

import { sidebarLinks } from '@/constants'
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import React from 'react'
import { useAuth } from '@clerk/nextjs';

const Bottombar = () => {
  const pathname = usePathname();
  const { userId } = useAuth();

  return (
    <section className='bottombar'>
      <div className='bottombar_container'>
        {sidebarLinks.map((link) => {
          const isActive =
            (pathname.includes(link.route) && link.route.length > 1) ||
            pathname === link.route;
          if (link.route === '/profile') link.route = `${link.route}/${userId}`

          return (
            <Link
              href={link.route}
              key={link.label}
              className={cn("bottombar_link", isActive && "bg-primary-500")}
            >
              <Image
                src={link.imgURL}
                alt={link.label}
                width={24}
                height={24}
              />
              <p className="text-subtile-medium text-light-1 max-sm:hidden">{link.label.split(/\s+./)[0]}</p>
            </Link>
          );
        })}
      </div>
    </section>
  )
}

export default Bottombar
'use client';

import React, { useEffect, useRef, useState } from 'react';

import Link from 'next/link';

import {
  Book,
  ChevronDown,
  Menu,
  Sparkles,
  Trees,
  XIcon,
  Zap,
} from 'lucide-react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';

import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

import { LoginForm } from './login-form';
import Logo from './logo';
import Modal from './modal';
import { SignupForm } from './signup-form';

interface MenuItem {
  title: string;
  url: string;
  description?: string;
  icon?: React.ReactNode;
  items?: MenuItem[];
}

interface Navbar1Props {
  className?: string;
  logo?: {
    url: string;
    src: string;
    alt: string;
    title: string;
    className?: string;
  };
  menu?: MenuItem[];
  auth?: {
    login: {
      title: string;
    };
    signup: {
      title: string;
    };
  };
}

const Navbar1 = ({
  menu = [
    { title: 'Home', url: '/' },
    {
      title: 'Layanan',
      url: '#',
      items: [
        {
          title: 'Jurnal Harian',
          description: 'Catat perasaan dan pantau perkembangan emosi kamu',
          icon: <Sparkles className="size-5 shrink-0" />,
          url: '/dashboard/journal',
        },
        {
          title: 'Deteksi Mood',
          description: 'Analisis mood dengan AI setiap hari',
          icon: <Zap className="size-5 shrink-0" />,
          url: '/dashboard/scanner',
        },
      ],
    },
    {
      title: 'Sumber Daya',
      url: '#',
      items: [
        {
          title: 'E-Book',
          description: 'Koleksi artikel dan e-book tentang kesehatan mental',
          icon: <Book className="size-5 shrink-0" />,
          url: '/e-book',
        },
        {
          title: 'Pusat Bantuan',
          description: 'Temukan jawaban untuk pertanyaan umum',
          icon: <Trees className="size-5 shrink-0" />,
          url: '#',
        },
      ],
    },
  ],
  auth = {
    login: { title: 'Masuk' },
    signup: { title: 'Daftar Baru' },
  },
  className,
}: Navbar1Props) => {
  const [activeAuth, setActiveAuth] = useState<'login' | 'signup' | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const initRef = useRef(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(!!data.user);
    });

    if (initRef.current) return;
    initRef.current = true;

    const params = new URLSearchParams(window.location.search);
    if (params.get('auth') === 'error') {
      alert('Gagal masuk. Silakan coba lagi.');
    }
    if (params.has('auth')) {
      queueMicrotask(() => {
        setActiveAuth('login');
        window.history.replaceState({}, '', window.location.pathname);
      });
    }
  }, []);

  const handleOpenLogin = () => setActiveAuth('login');
  const handleOpenSignup = () => setActiveAuth('signup');
  const handleClose = () => setActiveAuth(null);

  const authContent =
    activeAuth === 'login' ? (
      <LoginForm onSwitchToSignup={handleOpenSignup} />
    ) : activeAuth === 'signup' ? (
      <SignupForm onSwitchToLogin={handleOpenLogin} />
    ) : null;

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b',
        className
      )}
    >
      <div className="container-custom">
        {/* Desktop Menu */}
        <nav className="hidden items-center justify-between lg:flex">
          <div className="flex items-center gap-8">
            <Logo />
            <div className="flex items-center">
              <NavigationMenu>
                <NavigationMenuList className="gap-1">
                  {menu.map((item) => renderMenuItem(item))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button size="sm">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={handleOpenLogin}>
                  {auth.login.title}
                </Button>
                <Button size="sm" onClick={handleOpenSignup}>
                  {auth.signup.title}
                </Button>
              </>
            )}
            <Modal
              trigger={null}
              open={activeAuth !== null}
              onOpenChange={(open) => {
                if (!open) handleClose();
              }}
              content={{
                variant: 'direct',
                directContent: authContent,
              }}
            />
          </div>
        </nav>

        {/* Mobile Menu */}
        <div className="block lg:hidden">
          <div className="flex items-center">
            <Logo />
            <div className="ml-auto">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-muted/80"
                    aria-label="Open menu"
                  >
                    <Menu className="size-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 p-0">
                  <div className="flex h-full flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b p-4">
                      <Logo />
                      <SheetClose asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-muted"
                          aria-label="Close menu"
                        >
                          <XIcon className="size-4" />
                        </Button>
                      </SheetClose>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto overflow-x-hidden">
                      {/* Navigation Items */}
                      <div className="p-4 pb-2">
                        <Accordion
                          type="single"
                          collapsible
                          className="flex w-full flex-col gap-1"
                        >
                          {menu.map((item) => renderMobileMenuItem(item))}
                        </Accordion>
                      </div>

                      {/* Auth Section */}
                      <div className="border-t p-4 pt-4">
                        <div className="flex flex-col gap-2">
                          {isLoggedIn ? (
                            <SheetClose asChild>
                              <Link href="/dashboard">
                                <Button
                                  className="w-full justify-center"
                                  size="lg"
                                >
                                  Dashboard
                                </Button>
                              </Link>
                            </SheetClose>
                          ) : (
                            <>
                              <Button
                                variant="outline"
                                className="w-full justify-center"
                                size="lg"
                                onClick={() => {
                                  handleOpenLogin();
                                }}
                              >
                                {auth.login.title}
                              </Button>
                              <Button
                                className="w-full justify-center"
                                size="lg"
                                onClick={() => {
                                  handleOpenSignup();
                                }}
                              >
                                {auth.signup.title}
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
              <Modal
                trigger={null}
                open={activeAuth !== null}
                onOpenChange={(open) => {
                  if (!open) handleClose();
                }}
                content={{
                  variant: 'direct',
                  directContent: authContent,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

const renderMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <NavigationMenuItem key={item.title}>
        <NavigationMenuTrigger className="px-3">
          {item.title}
        </NavigationMenuTrigger>
        <NavigationMenuContent className="bg-popover text-popover-foreground">
          {item.items.map((subItem) => (
            <NavigationMenuLink asChild key={subItem.title} className="w-80">
              <SubMenuLink item={subItem} />
            </NavigationMenuLink>
          ))}
        </NavigationMenuContent>
      </NavigationMenuItem>
    );
  }

  return (
    <NavigationMenuItem key={item.title}>
      <NavigationMenuLink
        href={item.url}
        className="group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground"
      >
        {item.title}
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
};

const renderMobileMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <AccordionItem
        key={item.title}
        value={item.title}
        className="border-none"
      >
        <AccordionTrigger className="group flex w-full items-center justify-between rounded-xl bg-muted/30 px-5 py-4 text-left text-lg font-semibold transition-all hover:bg-muted/60 data-[state=open]:bg-muted/60">
          <span>{item.title}</span>
          <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </AccordionTrigger>
        <AccordionContent className="pt-3 pb-2">
          <div className="ml-3 flex flex-col gap-2 border-l-2 border-muted pl-4">
            {item.items.map((subItem) => (
              <SubMenuLink key={subItem.title} item={subItem} mobile />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    );
  }

  return (
    <Link
      key={item.title}
      href={item.url}
      className="block w-full rounded-xl px-5 py-4 text-lg font-semibold transition-colors hover:bg-muted/60"
    >
      {item.title}
    </Link>
  );
};

const SubMenuLink = ({
  item,
  mobile = false,
}: {
  item: MenuItem;
  mobile?: boolean;
}) => {
  if (mobile) {
    return (
      <Link
        className="flex flex-col gap-1.5 rounded-lg p-4 transition-colors hover:bg-muted/60"
        href={item.url}
      >
        <div className="flex items-center gap-3">
          <div className="text-primary">{item.icon}</div>
          <span className="text-base font-semibold text-foreground">
            {item.title}
          </span>
        </div>
        {item.description && (
          <p className="text-sm leading-relaxed text-muted-foreground pl-9">
            {item.description}
          </p>
        )}
      </Link>
    );
  }

  return (
    <a
      className="flex min-w-80 flex-row gap-4 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none hover:bg-muted hover:text-accent-foreground"
      href={item.url}
    >
      <div className="text-foreground">{item.icon}</div>
      <div>
        <div className="text-sm font-semibold">{item.title}</div>
        {item.description && (
          <p className="text-sm leading-snug text-muted-foreground">
            {item.description}
          </p>
        )}
      </div>
    </a>
  );
};

export { Navbar1 };

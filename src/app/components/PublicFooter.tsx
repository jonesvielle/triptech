"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IoLogoFacebook,
  IoLogoInstagram,
  IoLogoLinkedin,
  IoLogoWhatsapp,
} from "react-icons/io5";
import { robotoFontBodyLight } from "../helpers/fonts";

const adminOnlyRoutes = [
  "/services/solar/admin",
  "/services/solar/admin-native",
];

export default function PublicFooter() {
  const pathname = usePathname() || "";
  const isAdminRoute = adminOnlyRoutes.some((route) => pathname.startsWith(route));

  if (isAdminRoute) return null;

  return (
    <footer className="bg-primary-dark px-7 py-16 text-white md:px-28 md:py-20">
      <div className="mx-auto flex max-w-7xl flex-col gap-12 md:flex-row md:items-start">
        <div className="md:w-1/3 md:mr-20">
          <Image
            className="h-auto w-[200px] object-contain"
            height={90}
            width={200}
            alt="TRI-P Tech Limited logo"
            src="/images/logo/FLogo W MOD.png"
            priority
          />
          <p
            className={`${robotoFontBodyLight.className} mt-7 text-sm leading-7 text-white/90`}
          >
            TRI-P Tech Limited delivers solar systems, CCTV installation, 3D
            printing, prototyping, and product design support for homes and
            businesses. Contact us anytime to discuss your project.
          </p>
          <div className="mt-8 flex flex-row gap-5">
            <a
              className="rounded-full"
              href={process.env.NEXT_PUBLIC_FACEBOOKPAGE}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TRI-P Tech on Facebook"
            >
              <IoLogoFacebook className="rounded-full bg-white p-3 text-[50px] text-primary-dark" />
            </a>
            <a
              className="rounded-full"
              href={process.env.NEXT_PUBLIC_INSTAGRAM}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TRI-P Tech on Instagram"
            >
              <IoLogoInstagram className="rounded-full bg-white p-3 text-[50px] text-primary-dark" />
            </a>
            <a
              className="rounded-full"
              href={process.env.NEXT_PUBLIC_LINKEDIN}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TRI-P Tech on LinkedIn"
            >
              <IoLogoLinkedin className="rounded-full bg-white p-3 text-[50px] text-primary-dark" />
            </a>
            <a
              className="rounded-full"
              href="https://wa.me/2348144952854"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat with TRI-P Tech on WhatsApp"
            >
              <IoLogoWhatsapp className="rounded-full bg-white p-3 text-[50px] text-primary-dark" />
            </a>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-2 gap-8 text-sm">
          <div>
            <h3 className="font-bold">Services</h3>
            <FooterLink href="/services/solar">Solar Systems</FooterLink>
            <FooterLink href="/services/cctv-installation">CCTV Installation</FooterLink>
            <FooterLink href="/services/3d-printing">3D Printing</FooterLink>
            <FooterLink href="/contact">Design Consultation</FooterLink>
          </div>
          <div>
            <h3 className="font-bold">Company</h3>
            <FooterLink href="/about">About Us</FooterLink>
            <FooterLink href="/contact">Contact Us</FooterLink>
            <FooterLink href="/news">Latest News</FooterLink>
            <a
              href="https://wa.me/2348144952854"
              target="_blank"
              rel="noopener noreferrer"
              className={`${robotoFontBodyLight.className} mt-5 block text-white hover:underline`}
            >
              Live Chat
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`${robotoFontBodyLight.className} mt-5 block text-white hover:underline`}
    >
      {children}
    </Link>
  );
}


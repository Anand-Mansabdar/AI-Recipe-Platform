import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import Image from "next/image";
import { Cookie, Refrigerator, Sparkles } from "lucide-react";
import UserDropdown from "./UserDropdown";
import { checkUser } from "@/lib/checkUser";
import PricingModal from "./PricingModal";
import { Badge } from "./ui/badge";

const Header = async () => {
  const user = await checkUser();
  return (
    <header className="fixed top-0 w-full border-b border-neutral-200 bg-neutral-50/80 backdrop-blur-md z-50 supports-backdrop-filter:bg-stone-50/60">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href={user ? "/dashboard" : "/"}>
          <Image
            src="/orange-logo.png"
            alt="Logo"
            width={60}
            height={60}
            className="w-16"
          />
        </Link>
        <div className="text-neutral-900 hidden md:flex items-center space-x-8 text-sm font-medium">
          <Link
            href="/recipes"
            className="hover:text-orange-500 transition-colors flex gap-1.5 items-center"
          >
            <Cookie className="w-4 h-4" />
            My Recipes
          </Link>
          <Link
            href="/pantry"
            className="hover:text-orange-500 transition-colors flex gap-1.5 items-center"
          >
            <Refrigerator className="w-4 h-4" />
            My Pantry
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <SignedIn>
            {/* How to cook component will be rendered here */}

            {user && (
              <PricingModal subscriptionTier={user.subscriptionTier}>
                <Badge
                  variant="outline"
                  className={`flex h-8 px-3 gap-1.5 rounded-lg text-xs font-semibold transition-all ${user.subscriptionTier === "pro" ? "bg-linear-to-r from-orange-600 to-amber-500 text-white border-none shadow-sm" : "bg-stone-200/50 text-neutral-600 border-stone-200 cursor-pointer hover:bg-stone-300/50 hover:border-stone-300"}`}
                >
                  <Sparkles
                    className={`h-3 w-3 ${user.subscriptionTier === "pro" ? "text-white fill-black/20" : "text-neutral-200 fill-black"}`}
                  />
                  <span>
                    {user.subscriptionTier === "pro" ? "Pro Chef" : "Free Plan"}
                  </span>
                </Badge>
              </PricingModal>
            )}
            <UserDropdown />
            {/* <UserButton /> */}
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <Button
                variant="ghost"
                className="text-neutral-600 hover:text-orange-500 hover:bg-orange-50/80 font-medium"
              >
                Sign In
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button variant="primary" className="rounded-full px-6">
                Sign Up
              </Button>
            </SignUpButton>
          </SignedOut>
        </div>
      </nav>
    </header>
  );
};

export default Header;

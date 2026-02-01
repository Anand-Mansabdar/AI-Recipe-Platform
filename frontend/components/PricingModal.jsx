"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import PricingSection from "./PricingSection";

const PricingModal = ({ subsscriptionTier = "free", children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const canOpen = subsscriptionTier === "free";

  return (
    <Dialog open={isOpen} onOpenChange={canOpen ? setIsOpen : undefined}>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent className="p-8 pt-4 sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle />
          <PricingSection />
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default PricingModal;

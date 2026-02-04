"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Camera, Loader2, Plus } from "lucide-react";
import {
  addPantryItemManually,
  saveToPantry,
  scanPantryImage,
} from "@/actions/pantry.actions";
import useFetch from "@/hooks/use-fetch";
import { Button } from "./ui/button";
import { toast } from "sonner";

const AddToPantryModal = ({ isOpen, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState("scan");
  const [selectedImage, setSelectedImage] = useState(null);
  const [scannedIngredients, setScannedIngredients] = useState([]);
  const [manualItem, setManualItem] = useState({ name: "", quantity: "" });

  // Scan image
  const {
    loading: scanning,
    data: scanData,
    fn: scanImage,
  } = useFetch(scanPantryImage);

  // Save scanned items
  const {
    loading: saving,
    data: saveData,
    fn: saveScannedItems,
  } = useFetch(saveToPantry);

  // Add manual item
  const {
    loading: adding,
    data: addData,
    fn: addManualItem,
  } = useFetch(addPantryItemManually);

  const handleClose = () => {
    setActiveTab("scan");
    setSelectedImage(null);
    setScannedIngredients([]);
    setManualItem({ name: "", quantity: "" });
    onClose();
  };

  const handleAddManual = async (e) => {
    e.preventDefault();
    if (!manualItem.name.trim() || !manualItem.quantity.trim()) {
      toast.error("Missing required fields");
      return;
    }

    const formData = new FormData();
    formData.append("name", manualItem.name);
    formData.append("quantity", manualItem.quantity);
    await addManualItem(formData);
  };
  useEffect(() => {
    if (addData?.success) {
      toast.success("Item added to pantry");
      setManualItem({ name: "", quantity: "" });
      handleClose();
      if (onSuccess) onSuccess();
    }
  }, [addData]);
  return (
    <div>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent
          className={"max-w-3xl max-h-[90vh] overflow-y-auto rounded-none"}
        >
          <DialogHeader>
            <DialogTitle className={"text-2xl font-bold tracking-tight"}>
              Add to Pantry
            </DialogTitle>
            <DialogDescription>
              Scan Your Pantry with AI or Add Items Manually
            </DialogDescription>
          </DialogHeader>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className={"mt-4"}
          >
            <TabsList className={"grid w-full grid-cols-2"}>
              <TabsTrigger value="scan" className={"gap-2"}>
                <Camera className="w-4 h-4" />
                AI Scan
              </TabsTrigger>
              <TabsTrigger value="manual" className={"gap-2"}>
                <Plus className="w-4 h-4" />
                Add Manually
              </TabsTrigger>
            </TabsList>

            <TabsContent value="scan" className={"space-y-6 mt-6"}>
              Make Changes to your Account here.
            </TabsContent>
            <TabsContent value="manual" className={"mt-6"}>
              <form onSubmit={handleAddManual} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Ingredient Name
                  </label>
                  <input
                    type="text"
                    value={manualItem.name}
                    onChange={(e) =>
                      setManualItem({ ...manualItem, name: e.target.value })
                    }
                    placeholder="e.g Panner"
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    disabled={adding}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="text"
                    value={manualItem.quantity}
                    onChange={(e) =>
                      setManualItem({ ...manualItem, quantity: e.target.value })
                    }
                    placeholder="e.g 500gm, 2 cups..."
                    className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    disabled={adding}
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={adding}
                  className={"flex-1 text-white h-12 w-full"}
                >
                  {adding ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5 mr-2" />
                      Add Item
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddToPantryModal;

"use client";
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, Gift } from "lucide-react";

export default function WizardStepPricing({ errors, register, setValue, watch }) {
  const currentPrice = watch("price");
  const isFree = currentPrice === 0 || currentPrice === "0";

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div>
        <h3 className="text-xl font-bold mb-1">Pricing & Enrollment</h3>
        <p className="text-sm text-muted-foreground">
          Set the price for your course or make it freely available.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setValue("price", 0, { shouldValidate: true })}
          className={`p-4 border rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-center ${
            isFree
              ? "border-accent bg-accent/5 ring-2 ring-accent/20"
              : "border-border hover:border-accent/40 bg-card"
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm">Free Course</div>
            <div className="text-xs text-muted-foreground">Available to all learners</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            if (isFree) setValue("price", 10, { shouldValidate: true });
          }}
          className={`p-4 border rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-center ${
            !isFree
              ? "border-accent bg-accent/5 ring-2 ring-accent/20"
              : "border-border hover:border-accent/40 bg-card"
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm">Paid Course</div>
            <div className="text-xs text-muted-foreground">Stellar payment required</div>
          </div>
        </button>
      </div>

      {!isFree && (
        <div className="space-y-2 pt-2">
          <Label htmlFor="price" className="font-medium">
            Course Price (USD / XLM equivalent) <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-muted-foreground font-bold">
              $
            </span>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              placeholder="10.00"
              {...register("price", { valueAsNumber: true })}
              className={`pl-8 ${errors.price ? "border-red-500" : ""}`}
            />
          </div>
          {errors.price && (
            <p className="text-xs text-red-500 font-medium">{errors.price.message}</p>
          )}
        </div>
      )}
    </div>
  );
}

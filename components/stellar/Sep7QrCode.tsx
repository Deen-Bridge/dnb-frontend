"use client";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

export interface Sep7QrCodeProps {
  uri?: string;
  size?: number;
  caption?: string;
}

export default function Sep7QrCode({ uri, size = 168, caption }: Sep7QrCodeProps) {
  const [copied, setCopied] = useState<boolean>(false);

  if (!uri) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(uri);
      setCopied(true);
      toast.success("Payment URI copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy URI:", error);
      toast.error("Failed to copy URI");
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="p-3 bg-white border rounded-lg">
        <QRCodeSVG value={uri} size={size} />
      </div>
      <p className="text-xs text-muted-foreground text-center">
        {caption || "Scan with a Stellar mobile wallet"}
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleCopy}
        className="gap-1"
      >
        {copied ? (
          <>
            <Check className="h-3 w-3" />
            Copied
          </>
        ) : (
          <>
            <Copy className="h-3 w-3" />
            Copy URI
          </>
        )}
      </Button>
    </div>
  );
}

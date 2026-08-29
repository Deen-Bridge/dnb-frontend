import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/atoms/form/Button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function BulkCoursePublishDialog({ open, onOpenChange, courses, onConfirm }) {
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const needsConfirmation = courses.length > 10;

  const handleConfirm = async () => {
    if (needsConfirmation && confirmation !== "PUBLISH") return;
    setLoading(true);
    try {
      await onConfirm(courses);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Publish {courses.length} courses</DialogTitle>
          <DialogDescription>
            Are you sure you want to set these courses to live? This action will make them visible to all students.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-60 border rounded-md p-2 my-2">
          <ul className="text-sm space-y-1">
            {courses.map(c => <li key={c.id}>• {c.title}</li>)}
          </ul>
        </ScrollArea>

        {needsConfirmation && (
          <div className="space-y-2">
            <Label>Type <span className="font-bold">PUBLISH</span> to confirm</Label>
            <Input value={confirmation} onChange={(e) => setConfirmation(e.target.value)} placeholder="PUBLISH" />
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button 
            disabled={loading || (needsConfirmation && confirmation !== "PUBLISH")} 
            onClick={handleConfirm}
          >
            {loading ? "Publishing..." : "Confirm Publish"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogOverlay,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Circle } from "lucide-react";

const StepDialog = ({ open, setOpen, title, onCancel, onConfirm }) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogOverlay className="backdrop-blur bg-white/95" />
      <DialogContent className="min-w-[340px] md:min-w-[480px] max-w-4xl py-12 px-8 md:px-16 rounded-3xl shadow-2xl bg-white">
        <DialogHeader>
          <DialogTitle className="mb-6 text-3xl font-extrabold text-center md:text-4xl">
            {title}
          </DialogTitle>
        </DialogHeader>
        <DialogFooter className="flex flex-row gap-6 justify-center mt-8">
          <Button
            type="button"
            variant="outline"
            className="flex gap-2 justify-center items-center w-40 h-24 text-3xl font-bold rounded-2xl"
            onClick={onCancel}
          >
            <X className="!w-[1em] !h-[1em]" strokeWidth={2.5} />
            <span>취소</span>
          </Button>
          <Button
            type="button"
            className="flex gap-2 justify-center items-center w-40 h-24 text-3xl font-bold rounded-2xl"
            onClick={onConfirm}
            autoFocus
          >
            <Circle className="!w-[1em] !h-[1em]" strokeWidth={2.5} />
            <span>확인</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StepDialog;

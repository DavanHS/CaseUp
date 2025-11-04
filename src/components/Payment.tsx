import React, { Dispatch, SetStateAction } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
4
function PaymentModal({
  PaymentModalisOpen,
  PaymentModalsetIsOpen,
}: {
  PaymentModalisOpen: boolean;
  PaymentModalsetIsOpen: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <Dialog onOpenChange={PaymentModalsetIsOpen} open={PaymentModalisOpen}>
      <DialogContent className="absolute z-[99999]">
        <DialogHeader className="">
          <DialogTitle>Payment was successfull</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Getting your Order Summary
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}

export default PaymentModal;

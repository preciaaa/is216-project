"use client"

import { ReactNode } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTrigger } from "@/components/ui/dialog";

interface FormDialogButtonProps {
    title: string;
    label: string;
    form: ReactNode;
    description: string;
}

export function FormDialogButton({ title, label, description, form }: FormDialogButtonProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="px-4 py-2 bg-coral text-black hover:bg-coral/70 rounded">
                    {label}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    {title}
                </DialogHeader>
                <DialogDescription>
                    {description}
                </DialogDescription>
                {form}
            </DialogContent>
        </Dialog>
    )
}
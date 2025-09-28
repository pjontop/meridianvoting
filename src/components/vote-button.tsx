"use client";

import { useTransition, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { VariantProps } from "class-variance-authority";
import { buttonVariants } from "@/components/ui/button";

interface VoteButtonProps extends React.ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  projectId: string;
  hasVoted: boolean;
  canVote: boolean;
  children?: ReactNode;
  asChild?: boolean;
}

export function VoteButton({ 
  projectId, 
  hasVoted, 
  canVote, 
  children,
  variant,
  size,
  className,
  disabled,
  ...props 
}: VoteButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleVote = () => {
    if (!canVote && !hasVoted) return;

    startTransition(async () => {
      try {
        const response = await fetch("/api/votes/toggle", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectId,
            action: hasVoted ? "remove" : "add"
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to update vote");
        }

        router.refresh();
      } catch (err) {
        console.error("Vote error:", err);
      }
    });
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleVote}
      disabled={isPending || disabled}
      {...props}
    >
      {isPending ? "Updating..." : children}
    </Button>
  );
}
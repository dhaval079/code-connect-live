"use client"

import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { cn } from "@/lib/utils"

const Accordion = AccordionPrimitive.Root

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item 
    ref={ref} 
    className={cn("border-b", className)} 
    {...props} 
  />
))
AccordionItem.displayName = "AccordionItem"

type BaseProps = Omit<React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>, 'children'>;

interface AccordionTriggerProps extends BaseProps {
  children: React.ReactNode | ((props: { isExpanded: boolean }) => React.ReactNode);
}

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  AccordionTriggerProps
>(({ className, children, ...props }, ref) => {
  const [isExpanded, setIsExpanded] = React.useState(false)

  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={cn(
          "flex flex-1 items-center justify-between transition-all",
          className
        )}
        {...props}
        onMouseDown={() => setIsExpanded(!isExpanded)}
      >
        {typeof children === "function" ? children({ isExpanded }) : children}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
})
AccordionTrigger.displayName = "AccordionTrigger"

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className={cn(
      "overflow-hidden text-sm transition-all",
      "data-[state=closed]:animate-accordion-up",
      "data-[state=open]:animate-accordion-down"
    )}
    {...props}
  >
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
))
AccordionContent.displayName = "AccordionContent"

export { 
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  type AccordionTriggerProps
}
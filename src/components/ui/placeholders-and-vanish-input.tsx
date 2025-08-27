"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ArrowUp } from "lucide-react";

export function PlaceholdersAndVanishInput({
  placeholders,
  onChange,
  onSubmit,
}: {
  placeholders: string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startAnimation = () => {
    intervalRef.current = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
    }, 3000);
  };
  
  const handleVisibilityChange = () => {
    if (document.visibilityState !== "visible" && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    } else if (document.visibilityState === "visible") {
      startAnimation();
    }
  };

  useEffect(() => {
    startAnimation();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [placeholders]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const newDataRef = useRef<any[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [animating, setAnimating] = useState(false);

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 200; // max height in pixels
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [value]);

  const draw = useCallback(() => {
    if (!textareaRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 800;
    ctx.clearRect(0, 0, 800, 800);
    const computedStyles = getComputedStyle(textareaRef.current);

    const fontSize = parseFloat(computedStyles.getPropertyValue("font-size"));
    ctx.font = `${fontSize * 2}px ${computedStyles.fontFamily}`;
    ctx.fillStyle = "#FFF";
    ctx.fillText(value, 16, 40);

    const imageData = ctx.getImageData(0, 0, 800, 800);
    const pixelData = imageData.data;
    const newData: any[] = [];

    for (let t = 0; t < 800; t++) {
      let i = 4 * t * 800;
      for (let n = 0; n < 800; n++) {
        let e = i + 4 * n;
        if (
          pixelData[e] !== 0 &&
          pixelData[e + 1] !== 0 &&
          pixelData[e + 2] !== 0
        ) {
          newData.push({
            x: n,
            y: t,
            color: [
              pixelData[e],
              pixelData[e + 1],
              pixelData[e + 2],
              pixelData[e + 3],
            ],
          });
        }
      }
    }

    newDataRef.current = newData.map(({ x, y, color }) => ({
      x,
      y,
      r: 1,
      color: `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`,
    }));
  }, [value]);

  useEffect(() => {
    draw();
  }, [value, draw]);

  const animate = (start: number) => {
    const animateFrame = (pos: number = 0) => {
      requestAnimationFrame(() => {
        const newArr = [];
        for (let i = 0; i < newDataRef.current.length; i++) {
          const current = newDataRef.current[i];
          if (current.x < pos) {
            newArr.push(current);
          } else {
            if (current.r <= 0) {
              current.r = 0;
              continue;
            }
            current.x += Math.random() > 0.5 ? 1 : -1;
            current.y += Math.random() > 0.5 ? 1 : -1;
            current.r -= 0.05 * Math.random();
            newArr.push(current);
          }
        }
        newDataRef.current = newArr;
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx) {
          ctx.clearRect(pos, 0, 800, 800);
          newDataRef.current.forEach((t) => {
            const { x: n, y: i, r: s, color: color } = t;
            if (n > pos) {
              ctx.beginPath();
              ctx.rect(n, i, s, s);
              ctx.fillStyle = color;
              ctx.strokeStyle = color;
              ctx.stroke();
            }
          });
        }
        if (newDataRef.current.length > 0) {
          animateFrame(pos - 8);
        } else {
          setValue("");
          setAnimating(false);
        }
      });
    };
    animateFrame(start);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !animating) {
      e.preventDefault();
      vanishAndSubmit();
    }
  };

  const vanishAndSubmit = () => {
    if (!value.trim()) return;
    setAnimating(true);
    draw();

    const currentValue = textareaRef.current?.value || "";
    if (currentValue && textareaRef.current) {
      const maxX = newDataRef.current.reduce(
        (prev, current) => (current.x > prev ? current.x : prev),
        0
      );
      animate(maxX);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    vanishAndSubmit();
    onSubmit && onSubmit(e);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!animating) {
      setValue(e.target.value);
      // Update hidden input for compatibility
      if (hiddenInputRef.current) {
        hiddenInputRef.current.value = e.target.value;
        // Create a synthetic event for the hidden input
        const syntheticEvent = {
          ...e,
          target: hiddenInputRef.current,
          currentTarget: hiddenInputRef.current,
        } as React.ChangeEvent<HTMLInputElement>;
        onChange && onChange(syntheticEvent);
      }
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <motion.form
        onSubmit={handleSubmit}
        animate={{
          scale: isFocused ? 1.005 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
        }}
      >
        {/* Hidden input for compatibility */}
        <input
          ref={hiddenInputRef}
          type="hidden"
          value={value}
          onChange={() => {}} // Controlled by textarea
        />

        <motion.div
          className={cn(
            "relative bg-[#303030] text-white rounded-3xl overflow-hidden transition-all duration-300 shadow-lg",
            isFocused && "shadow-xl",
            isHovered && !isFocused && "shadow-md"
          )}
          animate={{
            borderColor: isFocused 
              ? "rgb(82 82 91)" // zinc-600
              : isHovered 
                ? "rgb(63 63 70)" // zinc-700
                : "rgb(63 63 70)", // zinc-700
          }}
          transition={{ duration: 0.2 }}
        >
          <canvas
            className={cn(
              "absolute pointer-events-none text-base transform scale-50 top-[20%] left-4 origin-top-left filter invert-0 pr-20 z-10",
              !animating ? "opacity-0" : "opacity-100"
            )}
            ref={canvasRef}
          />
          
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className={cn(
                "w-full bg-transparent text-white resize-none border-none outline-none",
                "text-base leading-6 placeholder:text-white",
                "px-5 py-4 pr-14",
                "min-h-[56px] max-h-[200px]",
                "scrollbar-thin scrollbar-thumb-zinc-600 scrollbar-track-transparent",
                animating && "text-transparent"
              )}
              style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              }}
              rows={1}
            />

            {/* Placeholder */}
            <div className="absolute inset-0 flex items-start pointer-events-none px-5 py-4">
              <AnimatePresence mode="wait">
                {!value && (
                  <motion.div
                    key={`placeholder-${currentPlaceholder}`}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{
                      duration: 0.3,
                      ease: [0.23, 1, 0.32, 1],
                    }}
                    className="text-gray-300 text-base leading-6 select-none"
                    style={{
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    }}
                  >
                    {placeholders[currentPlaceholder]}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={!value.trim() || animating}
              className={cn(
                "absolute bottom-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200",
                "bg-white text-zinc-900",
                "hover:bg-gray-100",
                "disabled:bg-zinc-600 disabled:text-zinc-400",
                "shadow-sm hover:shadow-md"
              )}
              animate={{
                scale: value.trim() && !animating ? 1 : 0.9,
                opacity: value.trim() && !animating ? 1 : 0.5,
              }}
              whileTap={{ scale: 0.95 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 25,
              }}
            >
              <ArrowUp size={16} strokeWidth={2.5} />
            </motion.button>
          </div>
        </motion.div>

        {/* Focus ring */}
        <motion.div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          animate={{
            opacity: isFocused ? 1 : 0,
            scale: isFocused ? 1.01 : 1,
          }}
          transition={{ duration: 0.2 }}
          style={{
            background: "linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.1), transparent)",
            filter: "blur(1px)",
            zIndex: -1,
          }}
        />
      </motion.form>
    </div>
  );
}
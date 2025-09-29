"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DeliveryStepProps {
  onSave: (delivery: { type: "now" | "scheduled"; date: Date | null }) => void;
}

const DeliveryStep = ({ onSave }: DeliveryStepProps) => {
  const [deliveryType, setDeliveryType] = useState<"now" | "scheduled">("now");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState("10:00");

  const handleSave = () => {
    if (deliveryType === "now") {
      onSave({ type: "now", date: null });
    } else {
      if (date) {
        const [hours, minutes] = time.split(":").map(Number);
        const scheduledDate = new Date(date);
        scheduledDate.setHours(hours, minutes);
        onSave({ type: "scheduled", date: scheduledDate });
      }
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto"
    >
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            When should we send it?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => setDeliveryType("now")}
                variant={deliveryType === "now" ? "default" : "outline"}
                className="w-full h-20 text-xl"
              >
                Send now
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => setDeliveryType("scheduled")}
                variant={deliveryType === "scheduled" ? "default" : "outline"}
                className="w-full h-20 text-xl"
              >
                Schedule
              </Button>
            </motion.div>
          </div>

          {deliveryType === "scheduled" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
              className="space-y-4 border p-4 rounded-lg"
            >
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Label className="font-semibold">Select a date</Label>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={{ before: today }}
                    className="rounded-md border mt-2 mx-auto"
                    initialFocus
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="time" className="font-semibold">
                    Select a time
                  </Label>
                  <div className="relative mt-2">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="time"
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="pl-10 h-12"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <Button
            onClick={handleSave}
            disabled={deliveryType === "scheduled" && !date}
            className="w-full text-lg py-6"
          >
            Save and continue
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DeliveryStep;
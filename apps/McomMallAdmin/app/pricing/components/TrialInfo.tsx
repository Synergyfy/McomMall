import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift } from 'lucide-react';

export default function TrialInfo() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      <Card className="mb-8 bg-white border-blue-200 shadow-lg  ">
        <CardHeader className="flex flex-row items-center gap-2">
          <Gift className="h-5 w-5 text-yellow-500" />
          <CardTitle className="text-2xl font-semibold text-blue-900">
            30-Day Trial
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-6 flex-col md:flex-row md:items-center">
          <p className="text-gray-700 md:text-xl">
            Try any selected plan with a 30-day trial requiring only a £1
            verification fee. The full subscription payment will be deferred
            until the end of the trial period.
          </p>
          <div className="w-full aspect-video">
            <iframe
              className="w-full h-full rounded-lg shadow-md"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="Demo Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

import { Card, CardContent } from '@/components/ui/card';

export default function ListingCardSkeleton() {
  return (
    <Card className="w-full overflow-hidden shadow-md border rounded-xl">
      <div className="relative animate-pulse">
        <div className="w-full h-56 bg-gray-300"></div>
        <div className="absolute top-4 left-4 z-10">
          <div className="px-3 py-1 text-xs bg-gray-400 rounded-md w-20 h-6"></div>
        </div>
        <div className="absolute top-4 right-4 z-10 bg-gray-400 p-2 rounded-full w-9 h-9"></div>
      </div>
      <CardContent className="p-4 bg-white animate-pulse">
        <div className="h-6 w-3/4 bg-gray-300 rounded"></div>
        <div className="flex items-center mt-2">
          <div className="w-4 h-4 mr-1 bg-gray-300 rounded"></div>
          <div className="h-4 w-1/2 bg-gray-300 rounded"></div>
        </div>
        <div className="flex justify-between items-center pt-3 mt-3 border-t">
          <div className="flex items-center">
            <div className="w-5 h-5 bg-gray-300 rounded"></div>
            <div className="h-4 w-8 ml-1 bg-gray-300 rounded"></div>
            <div className="h-4 w-10 ml-1 bg-gray-300 rounded"></div>
          </div>
          <div className="h-5 w-12 bg-gray-300 rounded"></div>
        </div>
      </CardContent>
    </Card>
  );
}

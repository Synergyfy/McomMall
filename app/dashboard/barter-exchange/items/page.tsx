// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// // import { Skeleton } from "@/components/ui/skeleton";
// import { PlusCircle } from "lucide-react";
// import Image from "next/image";

// type Item = {
//   id: string;
//   title: string;
//   type: "product" | "service";
//   description: string;
//   category: string;
//   imageUrl?: string;
//   estimatedValue?: string;
// };

// // 🧠 Mock data (replace with API or Supabase later)
// const mockUserItems: Item[] = [
//   {
//     id: "1",
//     title: "Vintage Camera",
//     type: "product",
//     description: "A fully functional vintage Nikon camera available for trade.",
//     category: "electronics",
//     imageUrl: "/images/camera.jpg",
//     estimatedValue: "$120",
//   },
//   {
//     id: "2",
//     title: "Logo Design Service",
//     type: "service",
//     description: "Offering professional logo design for small businesses.",
//     category: "design",
//     estimatedValue: "$80",
//   },
// ];

// export default function MyItemsPage() {
//   const [items, setItems] = useState<Item[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // simulate API call
//     const fetchItems = async () => {
//       setLoading(true);
//       await new Promise((res) => setTimeout(res, 1000));
//       setItems(mockUserItems); // Replace with actual fetch later
//       setLoading(false);
//     };

//     fetchItems();
//   }, []);

//   return (
//     <section className="max-w-5xl mx-auto py-12 px-4">
//       <div className="flex justify-between items-center mb-8">
//         <h1 className="text-3xl font-bold">My Products & Services</h1>
//         <Link href="/barter-exchange/items/add">
//           <Button>
//             <PlusCircle className="mr-2 h-4 w-4" /> Add New
//           </Button>
//         </Link>
//       </div>

//       {/* Loading state */}
//           {loading ? (
//            <div>Loading...</div>
//         // <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
//         //   {[1, 2, 3].map((i) => (
//         //     <Skeleton key={i} className="h-64 rounded-lg" />
//         //   ))}
//         // </div>
//       ) : items.length === 0 ? (
//         // Empty state
//         <div className="flex flex-col items-center justify-center py-20 text-center">
//           <p className="text-gray-600 text-lg mb-4">
//             You don’t have any products or services listed yet.
//           </p>
//           <Link href="/barter-exchange/items/add">
//             <Button>
//               <PlusCircle className="mr-2 h-4 w-4" /> Add Your First Listing
//             </Button>
//           </Link>
//         </div>
//       ) : (
//         // Items grid
//         <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
//           {items.map((item) => (
//             <Card key={item.id} className="hover:shadow-lg transition">
//               {item.imageUrl && (
//                 <Image
//                   src={item.imageUrl}
//                   alt={item.title}
//                   className="w-full h-40 object-cover rounded-t-md"
//                   width={500}
//                   height={300}
//                 />
//               )}
//               <CardHeader>
//                 <CardTitle className="flex justify-between items-center">
//                   <span>{item.title}</span>
//                   <span
//                     className={`text-xs px-2 py-1 rounded ${
//                       item.type === "service"
//                         ? "bg-blue-100 text-blue-700"
//                         : "bg-green-100 text-green-700"
//                     }`}
//                   >
//                     {item.type}
//                   </span>
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <p className="text-sm text-gray-700 line-clamp-3 mb-3">
//                   {item.description}
//                 </p>
//                 {item.estimatedValue && (
//                   <p className="text-sm text-gray-500">
//                     Value: {item.estimatedValue}
//                   </p>
//                 )}
//                 <div className="flex justify-end mt-3">
//                   <Button variant="outline" size="sm">
//                     View
//                   </Button>
//                 </div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       )}
//     </section>
//   );
// }

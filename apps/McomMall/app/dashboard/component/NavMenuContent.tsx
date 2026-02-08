'use client';

import Link from 'next/link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useGetCategories, useGetSectors } from '@/service/taxonomy/hook';

// Prop to handle closing the sheet on link click
interface NavMenuContentProps {
  onLinkClick?: () => void;
}

export function NavMenuContent({ onLinkClick }: NavMenuContentProps) {
  const { data: sectors = [] } = useGetSectors();
  const { data: categories = [] } = useGetCategories();

  const dynamicCategories = sectors.map(sector => ({
    title: sector.name,
    items: categories
      .filter(c => c.sectorId === sector.id)
      .map(c => c.name),
  }));

  return (
    <div className="flex flex-col space-y-2 text-lg font-medium">
      {/* Simple Links */}
      <Link
        href="/"
        onClick={onLinkClick}
        className="p-3 hover:bg-gray-100 rounded-md"
      >
        Home
      </Link>
      <Link
        href="/claim-listing"
        onClick={onLinkClick}
        className="p-3 hover:bg-gray-100 rounded-md"
      >
        Claim Listing
      </Link>
      <Link
        href="/dashboard/add-listing"
        onClick={onLinkClick}
        className="p-3 hover:bg-gray-100 rounded-md"
      >
        Create Listing
      </Link>

      {/* Accordion for Business Categories */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="business-category" className="border-b-0">
          <AccordionTrigger className="p-3 hover:no-underline hover:bg-gray-100 rounded-md">
            Business Category
          </AccordionTrigger>
          <AccordionContent className="pl-4">
            {dynamicCategories.map((category, i) => (
              <div key={i} className="mt-4 first:mt-2">
                <h3 className="font-semibold text-gray-800 mb-2">
                  {category.title}
                </h3>
                <ul className="space-y-1 pl-2">
                  {category.items.map((item, j) => (
                    <li key={j}>
                      <Link
                        href={`/listings?category=${encodeURIComponent(
                          category.title
                        )}&subcategory=${encodeURIComponent(item)}`}
                        onClick={onLinkClick}
                        className="block text-base font-normal text-gray-600 hover:text-red-500 py-1"
                      >
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Example for "Pages" menu */}
      <Link
        href="#"
        onClick={onLinkClick}
        className="p-3 hover:bg-gray-100 rounded-md"
      >
        Pages
      </Link>
    </div>
  );
}

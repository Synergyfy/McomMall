// app/marketplace/components/HorizontalScrollSection.tsx
import Image from 'next/image';

interface Item {
  name: string;
  image: string;
  price: string;
}

interface HorizontalScrollSectionProps {
  title: string;
  items: Item[];
}

const HorizontalScrollSection: React.FC<HorizontalScrollSectionProps> = ({ title, items }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <div className="flex overflow-x-auto space-x-4">
        {items.map((item, index) => (
          <div key={index} className="flex-shrink-0 w-48 text-center">
            <div className="w-48 h-48 bg-gray-50 rounded-lg flex items-center justify-center mb-2 overflow-hidden">
              <Image src={item.image} alt={item.name} width={192} height={192} className="object-cover" />
            </div>
            <p className="font-medium">{item.name}</p>
            <p className="text-lg font-bold text-blue-600">{item.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HorizontalScrollSection;

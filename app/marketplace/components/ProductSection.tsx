// app/marketplace/components/ProductSection.tsx
import Image from 'next/image';

interface Item {
  name: string;
  image: string;
  price: string;
}

interface ProductSectionProps {
  title: string;
  items: Item[];
}

const ProductSection: React.FC<ProductSectionProps> = ({ title, items }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <div className="h-96 overflow-y-auto">
        <ul className="space-y-4">
          {items.map((item, index) => (
            <li key={index} className="flex items-center space-x-4 p-2 rounded-md hover:bg-gray-100 cursor-pointer">
              <div className="w-24 h-24 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
                <Image src={item.image} alt={item.name} width={96} height={96} className="object-cover" />
              </div>
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-lg font-bold text-blue-600">{item.price}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProductSection;

"use client";

import { useState, ChangeEvent, useMemo, useEffect } from "react";
import ReactDOMServer from "react-dom/server";
import { GiftCardTemplate } from "@/service/gift-card/types";
import NewGiftCardPreview from "./NewGiftCardPreview";
import Accordion from "./Accordion";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";
import GiftCardEmail from "./GiftCardEmail";
import { useGetGiftCardAssets } from "@/service/hooks/useGiftCardService";
import { AssetCategory } from "@/service/gift-cards/types";
import Image from "next/image";

interface Errors {
  recipientName?: string;
  recipientEmail?: string;
}

interface NewGiftCardFlowProps {
  template: GiftCardTemplate;
}

const NewGiftCardFlow = ({ template }: NewGiftCardFlowProps) => {
  const { assets, isLoading } = useGetGiftCardAssets(template.id);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    recipientType: "someoneElse" as "myself" | "someoneElse",
    amount: template.fixedAmounts?.[0] ?? 25,
    recipientName: "",
    recipientEmail: "",
    personalMessage: "",
    design: {
      assetUrl: null as string | null,
      customImage: null as string | null,
      title: template.name,
      titleColor: template.textColor ?? "#000000",
      cardColor: template.backgroundColor ?? "#f0f0f0",
      additionalContent: template.description ?? "",
      redeemButtonText: "Redeem Gift",
      redeemButtonColor: "#ea580c",
      redeemButtonTextColor: "#ffffff",
    },
    delivery: {
      type: "now" as "now" | "scheduled",
      date: null as Date | null,
    },
  });
  const [errors, setErrors] = useState<Errors>({});

  const categories = useMemo(() => {
    if (!assets) return [];
    const allCategories = assets.flatMap((asset) => asset.categories);
    const uniqueCategories = allCategories.reduce((acc, category) => {
      if (!acc.find((c) => c.id === category.id)) {
        acc.push(category);
      }
      return acc;
    }, [] as AssetCategory[]);
    return uniqueCategories;
  }, [assets]);

  const filteredAssets = useMemo(() => {
    if (!assets) return [];
    if (!selectedCategory) return assets;
    return assets.filter((asset) =>
      asset.categories.some((c) => c.id === selectedCategory)
    );
  }, [assets, selectedCategory]);

  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].id);
    }
  }, [categories, selectedCategory]);

  useEffect(() => {
    if (filteredAssets.length > 0) {
      setFormData((prev) => ({
        ...prev,
        design: {
          ...prev.design,
          assetUrl: filteredAssets[0].url,
        },
      }));
    }
  }, [filteredAssets]);

  const validate = () => {
    const newErrors: Errors = {};
    if (!formData.recipientName) {
      newErrors.recipientName = "Recipient name is required.";
    }
    if (!formData.recipientEmail) {
      newErrors.recipientEmail = "Recipient email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.recipientEmail)) {
      newErrors.recipientEmail = "Email address is invalid.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const [section, field] = name.split(".");

    if (section === "design" && field) {
      setFormData((prev) => ({
        ...prev,
        design: { ...prev.design, [field]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name as keyof Errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleAmountChange = (amount: number) => {
    setFormData((prev) => ({ ...prev, amount }));
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleAssetSelect = (assetUrl: string) => {
    setFormData((prev) => ({
      ...prev,
      design: { ...prev.design, assetUrl: assetUrl, customImage: null },
    }));
  };

  const handleCustomImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          design: {
            ...prev.design,
            customImage: reader.result as string,
            assetUrl: null,
          },
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const isValid = validate();
    if (isValid) {
      const emailHtml = ReactDOMServer.renderToStaticMarkup(
        <GiftCardEmail formData={formData} />
      );
      console.log(emailHtml);
      console.log("Form is valid, but payment is disabled.", formData);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <h1 className="text-3xl font-bold mb-6">Create Your Gift Card</h1>
          <div className="space-y-2">
            <Accordion title="1. Choose Value" isOpen={true}>
              <div className="flex space-x-2">
                {[25, 50, 100, 200].map((value) => (
                  <button
                    key={value}
                    onClick={() => handleAmountChange(value)}
                    className={`px-6 py-3 rounded-lg text-lg font-semibold transition-all duration-200 ${
                      formData.amount === value
                        ? "bg-orange-600 text-white shadow-md scale-105"
                        : "bg-white text-gray-800 border border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    ${value}
                  </button>
                ))}
              </div>
            </Accordion>
            <Accordion title="2. Personalize your Card">
              <div className="space-y-6">
                {/* Recipient Info */}
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="recipientName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Recipient Name
                    </label>
                    <input
                      type="text"
                      id="recipientName"
                      name="recipientName"
                      value={formData.recipientName}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.recipientName
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500`}
                    />
                    {errors.recipientName && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.recipientName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="recipientEmail"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Recipient Email
                    </label>
                    <input
                      type="email"
                      id="recipientEmail"
                      name="recipientEmail"
                      value={formData.recipientEmail}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.recipientEmail
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500`}
                    />
                    {errors.recipientEmail && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.recipientEmail}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="personalMessage"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Personal Message (Optional)
                    </label>
                    <textarea
                      id="personalMessage"
                      name="personalMessage"
                      rows={4}
                      value={formData.personalMessage}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* Card Design */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Card Design
                  </label>
                  <div>
                    <label
                      htmlFor="design.title"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Title
                    </label>
                    <input
                      type="text"
                      id="design.title"
                      name="design.title"
                      value={formData.design.title}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="design.titleColor"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Title Color
                      </label>
                      <input
                        type="color"
                        id="design.titleColor"
                        name="design.titleColor"
                        value={formData.design.titleColor}
                        onChange={handleInputChange}
                        className="h-12 p-1 w-full"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="design.cardColor"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Card Color
                      </label>
                      <input
                        type="color"
                        id="design.cardColor"
                        name="design.cardColor"
                        value={formData.design.cardColor}
                        onChange={handleInputChange}
                        className="h-12 p-1 w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Redeem Button */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Redeem Button
                  </label>
                  <div>
                    <label
                      htmlFor="design.redeemButtonText"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Button Text
                    </label>
                    <input
                      type="text"
                      id="design.redeemButtonText"
                      name="design.redeemButtonText"
                      value={formData.design.redeemButtonText}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="design.redeemButtonColor"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Button Color
                      </label>
                      <input
                        type="color"
                        id="design.redeemButtonColor"
                        name="design.redeemButtonColor"
                        value={formData.design.redeemButtonColor}
                        onChange={handleInputChange}
                        className="h-12 p-1 w-full"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="design.redeemButtonTextColor"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Button Text Color
                      </label>
                      <input
                        type="color"
                        id="design.redeemButtonTextColor"
                        name="design.redeemButtonTextColor"
                        value={formData.design.redeemButtonTextColor}
                        onChange={handleInputChange}
                        className="h-12 p-1 w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Theme & Image */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Theme & Image
                  </label>
                  {isLoading ? (
                    <p>Loading themes...</p>
                  ) : (
                    <>
                      <div>
                        <label
                          htmlFor="category"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Select a category
                        </label>
                        <select
                          name="category"
                          id="category"
                          value={selectedCategory ?? ""}
                          onChange={(e) => handleCategoryChange(e.target.value)}
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md"
                        >
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Choose a design
                        </label>
                        <div className="grid grid-cols-3 gap-4 mt-2">
                          {filteredAssets.map((asset) => (
                            <div
                              key={asset.id}
                              onClick={() => handleAssetSelect(asset.url)}
                              className={cn(
                                "cursor-pointer rounded-lg border-2 p-2 transition-all",
                                "hover:border-orange-500",
                                formData.design.assetUrl === asset.url
                                  ? "border-orange-600"
                                  : "border-gray-200"
                              )}
                            >
                              <Image
                                src={asset.url}
                                alt={asset.name}
                                width={150}
                                height={100}
                                className="w-full h-auto rounded-md"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                  <div>
                    <label
                      htmlFor="customImageUpload"
                      className="w-full text-sm font-medium text-gray-700"
                    >
                      Or upload your own
                    </label>
                    <div className="mt-2 flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <label
                        htmlFor="customImageUpload"
                        className="flex flex-col items-center justify-center w-full h-full cursor-pointer"
                      >
                        <UploadCloud className="w-8 h-8 mb-2 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          SVG, PNG, JPG or GIF
                        </p>
                        <input
                          id="customImageUpload"
                          type="file"
                          className="hidden"
                          onChange={handleCustomImageUpload}
                          accept="image/*"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </Accordion>
            <Accordion title="3. Delivery Options">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    When should we send the gift card?
                  </label>
                  <div className="mt-2 flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="delivery.type"
                        value="now"
                        checked={formData.delivery.type === "now"}
                        onChange={() =>
                          setFormData((prev) => ({
                            ...prev,
                            delivery: { ...prev.delivery, type: "now" },
                          }))
                        }
                        className="form-radio h-4 w-4 text-orange-600 border-gray-300 focus:ring-orange-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Send Now
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="delivery.type"
                        value="scheduled"
                        checked={formData.delivery.type === "scheduled"}
                        onChange={() =>
                          setFormData((prev) => ({
                            ...prev,
                            delivery: { ...prev.delivery, type: "scheduled" },
                          }))
                        }
                        className="form-radio h-4 w-4 text-orange-600 border-gray-300 focus:ring-orange-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Schedule for Later
                      </span>
                    </label>
                  </div>
                </div>
                {formData.delivery.type === "scheduled" && (
                  <div>
                    <label
                      htmlFor="delivery.date"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Delivery Date
                    </label>
                    <input
                      type="date"
                      id="delivery.date"
                      name="delivery.date"
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          delivery: {
                            ...prev.delivery,
                            date: e.target.value
                              ? new Date(e.target.value)
                              : null,
                          },
                        }))
                      }
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                )}
              </div>
            </Accordion>
            <Accordion title="4. Review & Pay">
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Amount:</span>
                  <span className="font-semibold">${formData.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">
                    Recipient Name:
                  </span>
                  <span className="font-semibold">
                    {formData.recipientName || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">
                    Recipient Email:
                  </span>
                  <span className="font-semibold">
                    {formData.recipientEmail || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Delivery:</span>
                  <span className="font-semibold">
                    {formData.delivery.type === "now"
                      ? "Send Immediately"
                      : `Scheduled for ${
                          formData.delivery.date?.toLocaleDateString() || "N/A"
                        }`}
                  </span>
                </div>
                <div className="pt-4">
                  <button
                    onClick={handleSave}
                    className="w-full bg-orange-600 text-white font-bold py-3 px-4 rounded-md hover:bg-orange-700 transition-colors"
                  >
                    Save and Continue
                  </button>
                </div>
              </div>
            </Accordion>
          </div>
        </div>
        <div className="sticky top-8 self-start">
          <NewGiftCardPreview formData={formData} />
        </div>
      </div>
    </div>
  );
};

export default NewGiftCardFlow;
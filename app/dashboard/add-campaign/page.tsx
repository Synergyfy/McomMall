"use client";
import React, { useMemo, useState } from "react";
import { AdFormData, FormErrors } from "./types";
import { GeneralAdSettings } from "./components/GeneralAdSettings";
import { CampaignFilters } from "./components/CampaignFilters";
import { AdPlacementSelector } from "./components/AdPlacementSelector";
import { Button } from "@/components/ui/button";
import { adPlacements, mockRegions } from "./data";
import { isAfter, startOfToday } from "date-fns";
import { useAddCampaign } from "@/service/campaigns/hook";
import { businessCategories } from "@/lib/business-categories";
import {
  AdPlacement,
  CampaignType,
  CreateCampaignDto,
} from "@/service/campaigns/types";
import { SuccessCampaignDialog } from "./components/SuccessCampaignDialog";
import { useGetUserListings } from "@/service/listings/hook";
import { UserListing } from "@/service/listings/types";

const AddListingPage = () => {
  const [formData, setFormData] = useState<AdFormData>({
    listing: "",
    campaignType: "ppv",
    startDate: undefined,
    endDate: undefined,
    budget: "",
    category: "",
    region: "",
    locationSearch: "",
    forLoggedInUsers: false,
    placements: [],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSuccessDialogOpen, setSuccessDialogOpen] = useState(false);

  const addCampaignMutation = useAddCampaign();
  const {
    data: userListings,
    isLoading: isLoadingListings,
    isError: isErrorListings,
  } = useGetUserListings();

  const categories = useMemo(() => {
    return businessCategories.map((category) => ({
      value: category.name,
      label: category.name,
    }));
  }, []);

  const listingOptions = useMemo(() => {
    if (!userListings) return [];
    return userListings.data.map((listing: UserListing) => ({
      value: listing.id,
      label: listing.businessName,
    }));
  }, [userListings]);

  const togglePlacement = (id: string) => {
    setFormData((prev) => {
      const placements = prev.placements.includes(id)
        ? prev.placements.filter((p) => p !== id)
        : [...prev.placements, id];
      return { ...prev, placements };
    });
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.listing) {
      newErrors.listing = "A listing must be selected.";
    }
    if (!formData.startDate) {
      newErrors.startDate = "A start date is required.";
    } else if (!isAfter(formData.startDate, new Date())) {
      newErrors.startDate = "Start date must be in the future.";
    }

    if (!formData.endDate) {
      newErrors.endDate = "An end date is required.";
    } else if (
      formData.startDate &&
      !isAfter(formData.endDate, formData.startDate)
    ) {
      newErrors.endDate = "End date must be after the start date.";
    }

    if (!formData.budget || Number(formData.budget) <= 0) {
      newErrors.budget = "Budget must be a positive number.";
    }
    if (formData.placements.length === 0) {
      newErrors.placements = "At least one ad placement must be selected.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const campaignTypeMapping: { [key: string]: CampaignType } = {
        ppv: CampaignType.PAY_PER_VIEW,
        ppc: CampaignType.PAY_PER_CLICK,
      };

      const adPlacementMapping: { [key: string]: AdPlacement } = {
        homepage: AdPlacement.HOMEPAGE,
        search_top: AdPlacement.TOP_OF_SEARCH_RESULT,
        sidebar: AdPlacement.SIDE_BAR,
      };

      const campaignData: CreateCampaignDto = {
        businessId: formData.listing,
        type: campaignTypeMapping[formData.campaignType],
        startDate: formData.startDate!,
        endDate: formData.endDate,
        budget: Number(formData.budget),
        displayOnlyIfCategory: formData.category || undefined,
        displayOnlyIfRegion: formData.region || undefined,
        enabledForLoggedInUser: formData.forLoggedInUsers,
        adPlacement: formData.placements.map((p) => adPlacementMapping[p]),
      };

      addCampaignMutation.mutate(campaignData, {
        onSuccess: () => {
          setSuccessDialogOpen(true);
        },
      });
    } else {
      console.log("Form validation failed:", errors);
    }
  };

  return (
    <>
      <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <header className="mb-8">
            <p className="text-sm text-gray-500">Home &gt; Dashboard</p>
            <h1 className="text-3xl font-bold text-gray-900 mt-1">
              Manage Ads
            </h1>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            <GeneralAdSettings
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              listings={listingOptions}
              isLoading={isLoadingListings}
              isError={isErrorListings}
            />

            <AdPlacementSelector
              placementsData={adPlacements}
              selectedPlacements={formData.placements}
              togglePlacement={togglePlacement}
              error={errors.placements}
            />

            <CampaignFilters
              formData={formData}
              setFormData={setFormData}
              categories={categories}
            />

            <div className="flex justify-start">
              <Button
                type="submit"
                size="lg"
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold"
                disabled={addCampaignMutation.isPending}
              >
                {addCampaignMutation.isPending ? "Submitting..." : "Submit Ad"}
              </Button>
            </div>
          </form>
        </div>
      </div>
      <SuccessCampaignDialog
        open={isSuccessDialogOpen}
        onOpenChange={setSuccessDialogOpen}
      />
    </>
  );
};

export default AddListingPage;

import { GroupCircle, GroupCirclesResponse, NetworkContact } from "@/service/group-circle/types";
import { User } from "@/service/user/types";

export const MOCK_USER_PROFILE: User = {
    id: "user-prof-1",
    name: "Alex Professional",
    firstName: "Alex",
    lastName: "Professional",
    email: "alex@professional.com",
    phoneNumber: "+44 7700 900000",
    isActive: true,
    isEmailVerified: true,
    role: "PROFESSIONAL", // As per spec
    socials: { id: "soc-1" },
    giftCard: false,
    voucher: false,
    promotion: false,
    coupons: false
};

export const MOCK_REFERRED_BUSINESSES = [
    { businessId: "ref-1", name: "Alpha Supplies", relationshipTag: "Referred Partner" },
    { businessId: "ref-2", name: "Beta Logistics", relationshipTag: "Strategic Referral" },
    { businessId: "ref-3", name: "Gamma Marketing", relationshipTag: "Affiliate Business" },
];

export const MOCK_NETWORK_CONTACTS: NetworkContact[] = [
    { id: "mw-1", fullName: "John Smith", email: "john@smith-retail.co.uk", businessName: "Smith Retail", relationshipTag: "Partner", locationTag: "nearby", status: "accepted" },
    { id: "mw-2", fullName: "Sarah Jones", email: "sarah@jones-beauty.com", businessName: "Jones Beauty", relationshipTag: "Supplier", locationTag: "hyperlocal", status: "accepted" },
    { id: "mw-3", fullName: "Mike Brown", email: "mike@brown-tech.net", businessName: "Brown Tech", relationshipTag: "Affiliate", locationTag: "national", status: "accepted" },
    { id: "mw-4", fullName: "Emily White", email: "emily@white-events.org", businessName: "White Events", relationshipTag: "Partner", locationTag: "nearby", status: "accepted" },
    { id: "mw-5", fullName: "David Clark", email: "david@clark-consulting.biz", businessName: "Clark Consulting", relationshipTag: "Partner", locationTag: "hyperlocal", status: "accepted" },
    { id: "mw-6", fullName: "Lucy Green", email: "lucy@green-bakery.com", businessName: "Green Bakery", relationshipTag: "Partner", locationTag: "nearby", status: "accepted" },
];

export const MOCK_GROUP_CIRCLES_RESPONSE: GroupCirclesResponse = {
    data: [
        {
            id: "circle-1",
            name: "Premium Marketing Circle",
            type: "MARKETING",
            duration: 90,
            status: "ACTIVE",
            contributionAmount: 250,
            payoutFrequency: "MONTHLY",
            currentRound: 1,
            startDate: new Date().toISOString(),
            members: [
                { id: "m1", role: "OWNER", network: MOCK_NETWORK_CONTACTS[0] },
                { id: "m2", role: "MEMBER", network: MOCK_NETWORK_CONTACTS[1] },
                { id: "m3", role: "MEMBER", network: MOCK_NETWORK_CONTACTS[2] },
                { id: "m4", role: "MEMBER", network: MOCK_NETWORK_CONTACTS[3] },
                { id: "m5", role: "MEMBER", network: MOCK_NETWORK_CONTACTS[4] },
                { id: "m6", role: "MEMBER", network: MOCK_NETWORK_CONTACTS[5] },
            ]
        },
        {
            id: "circle-2",
            name: "Spring Advertising Collective",
            type: "ADVERTISING",
            duration: 180,
            status: "INACTIVE", // Recruiting
            contributionAmount: 250,
            payoutFrequency: "MONTHLY",
            currentRound: 0,
            startDate: new Date().toISOString(),
            members: [
                { id: "m7", role: "OWNER", network: MOCK_NETWORK_CONTACTS[0] },
                { id: "m8", role: "MEMBER", network: MOCK_NETWORK_CONTACTS[1] },
            ]
        }
    ],
    meta: {
        total: 2,
        page: 1,
        lastPage: 1,
        nextPage: null,
        prevPage: null
    }
};

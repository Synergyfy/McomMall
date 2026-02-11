export type GroupCircleType = 'MARKETING' | 'ADVERTISING' | 'NEARBY' | 'HYPERLOCAL' | 'NATIONAL' | 'GLOBAL' | 'SMART_MONEY';

export type GroupCircleDuration = 90 | 180 | 270 | 360 | string;

export type GroupCircleStatus = 'ACTIVE' | 'INACTIVE';

export type PayoutFrequency = 'WEEKLY' | 'MONTHLY';

export type MemberRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'BANKER' | 'GUEST' | 'PERIPHERAL';

export interface AddMemberDto {
    networkId: string;
    role: 'CORE' | 'PERIPHERAL' | 'BANKER' | 'PARTNER';
}

export type ContributionProvider = 'STRIPE' | 'PAYPAL' | 'MANUAL';
export type ContributionStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export interface InitiateContributionDto {
    memberId: string;
    amount: number;
    provider: ContributionProvider;
    round: number;
}

export interface InitiateContributionResponse {
    clientSecret?: string;
    orderId?: string;
}

export interface VerifyContributionDto {
    memberId: string;
    amount: number;
    round: number;
    provider: ContributionProvider;
    transactionId: string;
}

export interface Contribution {
    id: string;
    amount: number;
    round: number;
    status: ContributionStatus;
    paidAt: string;
    provider: ContributionProvider;
    transactionId: string;
}

export interface CreateGroupCircleDto {
    name: string;
    type: GroupCircleType;
    duration: GroupCircleDuration;
    contributionAmount: number;
    networkIds: string[];
    referredBusinessIds?: string[];
}

export interface NetworkContact {
    id: string;
    fullName: string;
    email: string;
    businessName?: string;
    relationshipTag?: string;
    locationTag?: string;
    status?: string;
}

export interface GroupCircleMember {
    id: string;
    role: MemberRole;
    drawDate?: string;
    network: NetworkContact;
}

export interface GroupCircle {
    id: string;
    name: string;
    type: GroupCircleType;
    duration: number;
    status: GroupCircleStatus;
    contributionAmount: number;
    payoutFrequency: PayoutFrequency;
    currentRound: number;
    startDate: string;
    members: GroupCircleMember[];
}
export interface GroupCirclesQueryParams {
    page?: number;
    limit?: number;
}

export interface GroupCirclesResponse {
    data: GroupCircle[];
    meta: {
        total: number;
        page: number;
        lastPage: number;
        nextPage: number | null;
        prevPage: number | null;
    };
}
export interface UpdateGroupCircleDto {
    name?: string;
    type?: GroupCircleType;
    duration?: GroupCircleDuration;
    networkIds?: string[];
    referredBusinessIds?: string[];
    contributionAmount?: number;
}
export interface SendMessageDto {
    content: string;
    recipientId?: string;
    senderId?: string;
}

export interface GroupCircleMessage {
    id: string;
    content: string;
    type: 'GROUP' | 'DIRECT';
    senderName: string;
    senderId: string;
    recipientId?: string;
    createdAt: string;
}

export interface MessageQueryParams {
    page?: number;
    limit?: number;
    type?: 'GROUP' | 'DIRECT';
    memberId?: string;
}

export interface MessagesResponse {
    data: GroupCircleMessage[];
    meta: {
        total: number;
        page: number;
        lastPage: number;
        nextPage: number | null;
        prevPage: number | null;
    };
}

export interface DiscoverableCircle extends GroupCircle {
    ownerName: string;
    isPublic: boolean;
    memberCount: number;
}

export interface DiscoverableCirclesResponse {
    data: DiscoverableCircle[];
    meta: {
        total: number;
        page: number;
        lastPage: number;
        nextPage: number | null;
        prevPage: number | null;
    };
}



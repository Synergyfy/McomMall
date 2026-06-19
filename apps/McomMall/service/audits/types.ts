export interface Suggestion {
  id: string;
  title: string;
  description: string;
  category: 'vouchers' | 'campaigns' | 'visibility' | 'storefront';
  impact: 'High' | 'Medium' | 'Low';
  actionLink: string;
  status: 'active' | 'resolved';
}

export interface Audit {
  id: string;
  type: 'short' | 'full' | 'storefront' | 'visibility';
  score: number;
  revenueLift: number;
  responses: Record<string, any>;
  suggestions: Suggestion[];
  userId: string;
  businessId?: string;
  created_at: string;
  updated_at: string;
}

export interface SubmitAuditDto {
  type: 'short' | 'full' | 'storefront' | 'visibility';
  responses: Record<string, any>;
  businessId?: string;
}

import { Injectable } from '@nestjs/common';

@Injectable()
export class HighStreetService {
  getNeighborhoodVitality(borough: string) {
    // Return structured high street readiness stats for the dashboard template
    return {
      borough: borough || 'Islington',
      readinessScore: 82,
      weeklyGrowth: '+4% from last week',
      activeBusinesses: 142,
      newBusinessesThisMonth: 12,
      ongoingEventsCount: 8,
      capacityPeakHour: '18:00',
      activePromotionsCount: 24,
      promoDiscountCode: 'STREET24',
      topContributors: [
        {
          rank: 1,
          name: 'Artisan Bakery & Co',
          details: '3 promos • 2 events today',
          score: 98,
          avatarUrl:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuBaew2W5cf6IpIRuhQxuqLFXRRJq_SbpUi3M13rtS1LjvmSMuvkR8lXDWW1lSwM57dhOFuRoxEJVwBWkj0rMkT2lZikTOeu8-cCgQkz2-WLxr7tJItUyyxcYcI3NAtkyloD0dj2XUmkwf34QzmWNs-Jracc5Mb7owHpHNqtQ8ihmyLDlgf0OmJ5OoY3APS25jKzZYdPpT2sR-nntPcnbwN4ozvRxwiCMzG70jnjiyAEE4vFnPAjgtfycCVAqOVVNV4QoSS5_H17xNI',
        },
        {
          rank: 2,
          name: 'The Green Florist',
          details: '1 promo • Fully staffed',
          score: 94,
          avatarUrl:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuAdD2g432RjYg_Q7J167xO2s1219L6K4M3o1O9_sH3X_D222tM321_H123... (placeholder or actual)',
        },
        {
          rank: 3,
          name: 'Urban Threads',
          details: 'Flash sale active',
          score: 91,
          avatarUrl:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuDo-yF9sNAuxfEapQcQXfxTAtodf3_sHhxSXVhYP7ULveEWG0cXs_5J1EnMD8zGYWKXb4NxmgWPdUSr66wuXFoGGPIrE9PC6zgzGCdvo_Sd_7s62QGsVHI9NYPQUXl-CbeXfuo-KPEQxIsdWey3IZahQttlGx3oKHrfqc-Hk3l95oTTds_9o_xSwrUpBDtRC6RywsZkXE7nNo2WsVA8_Ot28SgsmIab3cZwJfnQEd-R8zWMvYVxx3tpGoA9Hhjp5_NBdOMtFHLPWOI',
        },
      ],
      heatmapOverlays: [
        { name: 'Peak Hub', type: 'fire', lat: 51.5386, lng: -0.1028 },
        {
          name: 'Shops Ready',
          type: 'count',
          value: 12,
          lat: 51.5342,
          lng: -0.1065,
        },
      ],
    };
  }
}

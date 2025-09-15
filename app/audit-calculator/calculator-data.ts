import {
  Utensils,
  ShoppingCart,
  Wrench,
  Heart,
  Stethoscope,
  Building,
  Dumbbell,
  Car,
  Dog,
  Plane,
  Factory,
  Users,
  GraduationCap,
  Ticket,
  Briefcase,
} from 'lucide-react';

export type IndustryCategory =
  | 'Hospitality'
  | 'Shopping & Retail'
  | 'Trades & Home Services'
  | 'Beauty & Wellness'
  | 'Health & Medical'
  | 'Property & Real Estate'
  | 'Fitness & Sports'
  | 'Automotive & Transport'
  | 'Pets & Animal Services'
  | 'Accommodation & Travel'
  | 'Manufacturing & Industrial'
  | 'Non-Profit & Community'
  | 'Education & Training'
  | 'Arts, Entertainment & Events'
  | 'Media, Marketing & Professional Services';

export type InputField = {
  id: string;
  label: string;
  tooltip: string;
  unit?: string;
  isCurrency?: boolean;
  defaultValue: string;
};

export type Industry = {
  name: IndustryCategory;
  icon: React.ComponentType<{ className?: string }>;
  fields: InputField[];
  calculation: (inputs: Record<string, number>) => number;
};

export const industries: Industry[] = [
  {
    name: 'Hospitality',
    icon: Utensils,
    fields: [
      { id: 'avgSpend', label: 'Average spend per customer', tooltip: 'The average amount a customer spends in one visit.', isCurrency: true, defaultValue: '15' },
      { id: 'capacity', label: 'Seating / customer capacity', tooltip: 'The total number of seats or standing capacity.', defaultValue: '40' },
      { id: 'sittingsPerDay', label: 'Average sittings per seat per day', tooltip: 'How many times each seat is occupied by a new customer daily.', defaultValue: '2' },
      { id: 'daysOpen', label: 'Days open per week', tooltip: 'The number of days your business is open each week (1-7).', defaultValue: '6' },
      { id: 'weeksOpen', label: 'Weeks open per year', tooltip: 'The number of weeks your business is open annually (max 52).', defaultValue: '50' },
      { id: 'turnover', label: 'Current yearly turnover', tooltip: 'Your total sales revenue from the last year.', isCurrency: true, defaultValue: '250000' },
    ],
    calculation: (inputs) => (inputs.avgSpend * inputs.capacity * inputs.sittingsPerDay * inputs.daysOpen * inputs.weeksOpen),
  },
  {
    name: 'Shopping & Retail',
    icon: ShoppingCart,
    fields: [
        { id: 'stockValue', label: 'Total non-discounted value of stock', tooltip: 'The total retail value of all your current stock.', isCurrency: true, defaultValue: '20000' },
        { id: 'daysToRestock', label: 'Days to restock if all stock sold', tooltip: 'How many days it takes to fully replenish your stock.', defaultValue: '10' },
        { id: 'turnover', label: 'Current yearly turnover', tooltip: 'Your total sales revenue from the last year.', isCurrency: true, defaultValue: '400000' },
    ],
    calculation: (inputs) => inputs.stockValue * (365 / inputs.daysToRestock),
  },
  {
    name: 'Trades & Home Services',
    icon: Wrench,
    fields: [
      { id: 'hourlyRate', label: 'Average hourly charge', tooltip: 'The standard rate you charge per hour of work.', isCurrency: true, defaultValue: '50' },
      { id: 'staffCount', label: 'Number of revenue-generating staff', tooltip: 'The number of employees who perform billable work.', defaultValue: '3' },
      { id: 'billableHours', label: 'Average billable hours per person per day', tooltip: 'The average hours of paid work each staff member does daily.', defaultValue: '8' },
      { id: 'daysWorked', label: 'Days worked per person per week', tooltip: 'The average number of days each person works weekly.', defaultValue: '5' },
      { id: 'weeksWorked', label: 'Weeks worked per year', tooltip: 'The number of weeks your staff work annually (max 52).', defaultValue: '48' },
      { id: 'turnover', label: 'Current yearly turnover', tooltip: 'Your total sales revenue from the last year.', isCurrency: true, defaultValue: '200000' },
    ],
    calculation: (inputs) => inputs.hourlyRate * inputs.staffCount * inputs.billableHours * inputs.daysWorked * inputs.weeksWorked,
  },
  {
    name: 'Beauty & Wellness',
    icon: Heart,
    fields: [
      { id: 'avgAppointmentValue', label: 'Average appointment value', tooltip: 'The average price of a single booking or service.', isCurrency: true, defaultValue: '30' },
      { id: 'therapists', label: 'Number of service chairs/therapists', tooltip: 'The number of chairs or staff available to serve clients at one time.', defaultValue: '2' },
      { id: 'slotsPerDay', label: 'Avg. appointment slots per chair per day', tooltip: 'The average number of appointments each chair/therapist handles daily.', defaultValue: '8' },
      { id: 'daysOpen', label: 'Days open per week', tooltip: 'The number of days your business is open weekly.', defaultValue: '5' },
      { id: 'weeksOpen', label: 'Weeks open per year', tooltip: 'The number of weeks your business is open annually.', defaultValue: '48' },
      { id: 'turnover', label: 'Current yearly turnover', tooltip: 'Your total sales revenue from the last year.', isCurrency: true, defaultValue: '80000' },
    ],
    calculation: (inputs) => inputs.avgAppointmentValue * inputs.therapists * inputs.slotsPerDay * inputs.daysOpen * inputs.weeksOpen,
  },
  {
    name: 'Health & Medical',
    icon: Stethoscope,
    fields: [
        { id: 'consultationFee', label: 'Average consultation / treatment fee', tooltip: 'The average fee for a single consultation or treatment.', isCurrency: true, defaultValue: '60' },
        { id: 'clinicians', label: 'Number of clinicians/rooms', tooltip: 'The number of clinicians or rooms that deliver paid services.', defaultValue: '2' },
        { id: 'consultationsPerDay', label: 'Consultations per clinician per day', tooltip: 'The average number of consultations each clinician performs daily.', defaultValue: '12' },
        { id: 'daysOpen', label: 'Days open per week', tooltip: 'The number of days your practice is open weekly.', defaultValue: '5' },
        { id: 'weeksOpen', label: 'Weeks open per year', tooltip: 'The number of weeks your practice is open annually.', defaultValue: '48' },
        { id: 'turnover', label: 'Current yearly turnover', tooltip: 'Your total revenue from the last year.', isCurrency: true, defaultValue: '200000' },
    ],
    calculation: (inputs) => inputs.consultationFee * inputs.clinicians * inputs.consultationsPerDay * inputs.daysOpen * inputs.weeksOpen,
  },
  {
    name: 'Property & Real Estate',
    icon: Building,
    fields: [
        { id: 'avgFee', label: 'Average commission / service fee per transaction', tooltip: 'The average fee earned from a single sale or rental.', isCurrency: true, defaultValue: '1500' },
        { id: 'transactionsPerMonth', label: 'Average number of transactions per month', tooltip: 'The average number of sales or rentals completed each month.', defaultValue: '8' },
        { id: 'monthsActive', label: 'Months active per year', tooltip: 'The number of months your business operates annually.', defaultValue: '12' },
        { id: 'turnover', label: 'Current yearly turnover', tooltip: 'Your total revenue from the last year.', isCurrency: true, defaultValue: '100000' },
    ],
    calculation: (inputs) => inputs.avgFee * inputs.transactionsPerMonth * inputs.monthsActive,
  },
  {
    name: 'Fitness & Sports',
    icon: Dumbbell,
    fields: [
        { id: 'avgFee', label: 'Average membership/booking fee', tooltip: 'The average fee per member or booking.', isCurrency: true, defaultValue: '40' },
        { id: 'maxCapacity', label: 'Maximum members/clients capacity', tooltip: 'The total number of members or clients you can serve.', defaultValue: '500' },
        { id: 'monthsOpen', label: 'Months open per year', tooltip: 'The number of months your business operates annually.', defaultValue: '12' },
        { id: 'turnover', label: 'Current yearly turnover', tooltip: 'Your total revenue from the last year.', isCurrency: true, defaultValue: '180000' },
    ],
    calculation: (inputs) => inputs.avgFee * inputs.maxCapacity * inputs.monthsOpen,
  },
  {
    name: 'Automotive & Transport',
    icon: Car,
    fields: [
        { id: 'avgRevenuePerJob', label: 'Average revenue per job/service', tooltip: 'The average income from a single job or service.', isCurrency: true, defaultValue: '80' },
        { id: 'jobsPerDay', label: 'Jobs/services possible per day', tooltip: 'The maximum number of jobs you can complete in a day.', defaultValue: '10' },
        { id: 'daysPerWeek', label: 'Working days per week', tooltip: 'The number of days you operate each week.', defaultValue: '5' },
        { id: 'weeksOpen', label: 'Weeks open per year', tooltip: 'The number of weeks you operate annually.', defaultValue: '48' },
        { id: 'turnover', label: 'Current yearly turnover', tooltip: 'Your total revenue from the last year.', isCurrency: true, defaultValue: '150000' },
    ],
    calculation: (inputs) => inputs.avgRevenuePerJob * inputs.jobsPerDay * inputs.daysPerWeek * inputs.weeksOpen,
  },
  {
    name: 'Pets & Animal Services',
    icon: Dog,
    fields: [
        { id: 'avgFee', label: 'Average service/booking fee', tooltip: 'The average price for a single service or booking.', isCurrency: true, defaultValue: '35' },
        { id: 'appointmentsPerDay', label: 'Max appointments/pet slots per day', tooltip: 'The maximum number of appointments or pets you can handle daily.', defaultValue: '12' },
        { id: 'daysOpen', label: 'Days open per week', tooltip: 'The number of days you operate each week.', defaultValue: '5' },
        { id: 'weeksOpen', label: 'Weeks per year', tooltip: 'The number of weeks you operate annually.', defaultValue: '50' },
        { id: 'turnover', label: 'Current yearly turnover', tooltip: 'Your total revenue from the last year.', isCurrency: true, defaultValue: '70000' },
    ],
    calculation: (inputs) => inputs.avgFee * inputs.appointmentsPerDay * inputs.daysOpen * inputs.weeksOpen,
  },
  {
    name: 'Accommodation & Travel',
    icon: Plane,
    fields: [
        { id: 'avgBookingValue', label: 'Average booking value', tooltip: 'The average value of a single booking.', isCurrency: true, defaultValue: '100' },
        { id: 'totalSpaces', label: 'Number of rooms/seats/spaces available', tooltip: 'The total number of rooms or spaces available.', defaultValue: '20' },
        { id: 'daysOpen', label: 'Days open per year', tooltip: 'The number of days you operate annually (1-365).', defaultValue: '300' },
        { id: 'turnover', label: 'Current yearly turnover', tooltip: 'Your total revenue from the last year.', isCurrency: true, defaultValue: '400000' },
    ],
    calculation: (inputs) => inputs.avgBookingValue * inputs.totalSpaces * inputs.daysOpen,
  },
  {
    name: 'Manufacturing & Industrial',
    icon: Factory,
    fields: [
        { id: 'avgOrderValue', label: 'Average value per order', tooltip: 'The average value of a single order.', isCurrency: true, defaultValue: '2000' },
        { id: 'ordersPerWeek', label: 'Maximum orders / jobs per week', tooltip: 'The maximum number of orders or jobs you can handle weekly.', defaultValue: '10' },
        { id: 'weeksOpen', label: 'Weeks open per year', tooltip: 'The number of weeks you operate annually.', defaultValue: '48' },
        { id: 'turnover', label: 'Current yearly turnover', tooltip: 'Your total revenue from the last year.', isCurrency: true, defaultValue: '700000' },
    ],
    calculation: (inputs) => inputs.avgOrderValue * inputs.ordersPerWeek * inputs.weeksOpen,
  },
  {
    name: 'Non-Profit & Community',
    icon: Users,
    fields: [
        { id: 'avgDonation', label: 'Average donation / membership value', tooltip: 'The average value of a single donation or membership.', isCurrency: true, defaultValue: '20' },
        { id: 'maxMembers', label: 'Maximum donors / members you can support', tooltip: 'The total number of donors or members you can support.', defaultValue: '500' },
        { id: 'monthsActive', label: 'Months active per year', tooltip: 'The number of months your organization is active annually.', defaultValue: '12' },
        { id: 'turnover', label: 'Current yearly income', tooltip: 'Your total income from the last year.', isCurrency: true, defaultValue: '80000' },
    ],
    calculation: (inputs) => inputs.avgDonation * inputs.maxMembers * inputs.monthsActive,
  },
  {
    name: 'Education & Training',
    icon: GraduationCap,
    fields: [
        { id: 'avgFee', label: 'Average course/tuition fee', tooltip: 'The average fee per course or student.', isCurrency: true, defaultValue: '100' },
        { id: 'maxStudents', label: 'Maximum students per session', tooltip: 'The maximum number of students per session.', defaultValue: '20' },
        { id: 'sessionsPerWeek', label: 'Sessions per week', tooltip: 'The number of sessions you run each week.', defaultValue: '4' },
        { id: 'weeksPerYear', label: 'Weeks per year', tooltip: 'The number of weeks you operate annually.', defaultValue: '40' },
        { id: 'turnover', label: 'Current yearly turnover', tooltip: 'Your total revenue from the last year.', isCurrency: true, defaultValue: '200000' },
    ],
    calculation: (inputs) => inputs.avgFee * inputs.maxStudents * inputs.sessionsPerWeek * inputs.weeksPerYear,
  },
  {
    name: 'Arts, Entertainment & Events',
    icon: Ticket,
    fields: [
        { id: 'ticketPrice', label: 'Average ticket / booking price', tooltip: 'The average price of a single ticket or booking.', isCurrency: true, defaultValue: '25' },
        { id: 'maxAttendees', label: 'Max seats / attendees per event', tooltip: 'The maximum number of attendees per event.', defaultValue: '500' },
        { id: 'eventsPerYear', label: 'Number of events per year', tooltip: 'The total number of events you hold annually.', defaultValue: '40' },
        { id: 'turnover', label: 'Current yearly turnover', tooltip: 'Your total revenue from the last year.', isCurrency: true, defaultValue: '350000' },
    ],
    calculation: (inputs) => inputs.ticketPrice * inputs.maxAttendees * inputs.eventsPerYear,
  },
  {
    name: 'Media, Marketing & Professional Services',
    icon: Briefcase,
    fields: [
        { id: 'avgProjectValue', label: 'Average client/project value', tooltip: 'The average value of a single client project.', isCurrency: true, defaultValue: '5000' },
        { id: 'maxClients', label: 'Max clients/projects at one time', tooltip: 'The maximum number of clients or projects you can handle simultaneously.', defaultValue: '10' },
        { id: 'cyclesPerYear', label: 'Average project cycles per year', tooltip: 'The number of times you complete a project cycle for a client slot in a year.', defaultValue: '6' },
        { id: 'turnover', label: 'Current yearly turnover', tooltip: 'Your total revenue from the last year.', isCurrency: true, defaultValue: '200000' },
    ],
    calculation: (inputs) => inputs.avgProjectValue * inputs.maxClients * inputs.cyclesPerYear,
  },
];

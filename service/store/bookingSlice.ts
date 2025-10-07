import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ServiceBookingDetailsDto } from '@/hooks/useCheckout';

interface BookingState {
  bookings: Record<string, ServiceBookingDetailsDto | null>;
  loading: boolean;
}

const initialState: BookingState = {
  bookings: {},
  loading: false,
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    addBooking: (
      state,
      action: PayloadAction<{
        productId: string;
        bookingDetails: ServiceBookingDetailsDto;
      }>
    ) => {
      state.bookings[action.payload.productId] = action.payload.bookingDetails;
    },
    clearBooking: (state, action: PayloadAction<string>) => {
      state.bookings[action.payload] = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { addBooking, clearBooking, setLoading } = bookingSlice.actions;
export default bookingSlice.reducer;
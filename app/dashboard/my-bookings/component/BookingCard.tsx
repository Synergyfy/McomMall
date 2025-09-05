import {
  LucideCalendar,
  LucideUsers,
  LucideMail,
  LucidePhone,
  LucideMapPin,
} from 'lucide-react';
import React from 'react';

interface BookingDetails {
  id: string;
  date: string;
  time: string;
  guests: number;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  phoneNumber: string;
  location: string;
  requestedOn: string;
}

interface BookingCardProps {
  booking: BookingDetails;
  onSendMessage: () => void;
  onCancel: () => void;
}

const BookingDate: React.FC<{ date: string; time: string }> = ({
  date,
  time,
}) => (
  <div className="flex items-center p-2 bg-gray-100 rounded-lg">
    <LucideCalendar className="w-5 h-5 mr-2 text-gray-500" />
    <div>
      <div className="text-sm text-gray-600">Date</div>
      <div className="font-medium">{date}</div>
      <div className="text-sm text-gray-600">{time}</div>
    </div>
  </div>
);

const BookingDetailsSection: React.FC<{ guests: number }> = ({ guests }) => (
  <div className="flex items-center p-2 bg-gray-100 rounded-lg">
    <LucideUsers className="w-5 h-5 mr-2 text-gray-500" />
    <div>
      <div className="text-sm text-gray-600">Guests</div>
      <div className="font-medium">{guests}</div>
    </div>
  </div>
);

const OwnerSection: React.FC<{
  name: string;
  email: string;
  phone: string;
}> = ({ name, email, phone }) => (
  <div className="flex items-center p-2 bg-gray-100 rounded-lg">
    <LucideMail className="w-5 h-5 mr-2 text-gray-500" />
    <div>
      <div className="text-sm text-gray-600">Owner</div>
      <div className="font-medium">{name}</div>
      <div className="text-sm text-gray-600">{email}</div>
      <div className="text-sm text-gray-600">{phone}</div>
    </div>
  </div>
);

const PhoneSection: React.FC<{ phone: string }> = ({ phone }) => (
  <div className="flex items-center p-2 bg-gray-100 rounded-lg">
    <LucidePhone className="w-5 h-5 mr-2 text-gray-500" />
    <div>
      <div className="text-sm text-gray-600">Phone</div>
      <div className="font-medium">{phone}</div>
    </div>
  </div>
);

const LocationSection: React.FC<{ location: string }> = ({ location }) => (
  <div className="flex items-center p-2 bg-gray-100 rounded-lg">
    <LucideMapPin className="w-5 h-5 mr-2 text-gray-500" />
    <div>
      <div className="text-sm text-gray-600">Booking Location</div>
      <div className="font-medium">{location}</div>
    </div>
  </div>
);

const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onSendMessage,
  onCancel,
}) => {
  return (
    <div
      className="bg-white rounded-lg shadow-md p-4 border border-gray-200 w-[45%]"
      // initial={{ opacity: 0, y: 20 }}
      // animate={{ opacity: 1, y: 0 }}
      // transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold">{`Tom's Restaurant`}</h2>
          <p className="text-sm text-gray-600">Booking #{booking.id}</p>
        </div>
        <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
          Waiting for owner confirmation
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <BookingDate date={booking.date} time={booking.time} />
        <BookingDetailsSection guests={booking.guests} />
        <OwnerSection
          name={booking.ownerName}
          email={booking.ownerEmail}
          phone={booking.ownerPhone}
        />
        <PhoneSection phone={booking.phoneNumber} />
        <LocationSection location={booking.location} />
        hello
      </div>
      <div className="text-sm text-gray-600 mb-4">{booking.requestedOn}</div>
      <div className="flex justify-end space-x-4">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          onClick={onSendMessage}
        >
          Send Message
        </button>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default BookingCard;

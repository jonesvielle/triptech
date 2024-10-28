export type BookAppointmentRequestPayloadType = {
  fullName: string;
  phone: string;
  email: string;
  appointmentDate: string;
  appointmentDetails: string;
};

export type QuotationRequestPayloadType = {
  fullName: string;
  phone: string;
  email: string;
  appointmentDate: string;
  serviceRequired: string;
  fullDescription: string;
};

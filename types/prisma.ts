import { Prisma } from "@prisma/client";

// 1. Case with relations (For CaseTable and CaseDialog)
export type CaseWithRelations = Prisma.CaseGetPayload<{
  include: {
    formReply: true;
    participant: {
      select: {
        id: true;
        name: true;
        participant_id: true;
        email: true;
        tel: true;
      };
    };
  };
}>;

// 2. HMS Incident with relations (For HMS Dashboard and Dialog)
export type HmsWithRelations = Prisma.HMSGetPayload<{
  include: {
    reportedBy: {
      select: { email: true };
    };
    participantObject: {
      select: {
        name: true;
        participant_id: true;
      };
    };
    case: {
      include: {
        formReply: {
          select: {
            from: true;
            to: true;
          };
        };
      };
    };
  };
}>;

// 3. Participant with deep relations (For Participant Details Page)
export type ParticipantWithRelations = Prisma.ParticipantGetPayload<{
  include: {
    region: true;
    organization: true;

    // History of HMS incidents (Needs reportedBy for the table)
    hms: {
      orderBy: { createdAt: "desc" };
      include: {
        reportedBy: {
          select: { email: true };
        };
      };
    };

    // History of Absence Cases (Needs formReply for the table)
    cases: {
      orderBy: { id: "desc" };
      include: {
        formReply: true;
      };
    };
  };
}>;

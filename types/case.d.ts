// In case.d.ts or case.ts

interface FormReply {
  id: number;
  name: string | null;
  participant_id: string | null;
  email: string | null;
  tel: string | null;
  county: string | null;
  type: string | null;
  from: Date | null;
  to: Date | null;
  reason: string | null;
  has_observer: boolean | null;
  observer_name: string | null;
  observer_id: string | null;
  observer_tel: string | null;
  // Add other properties of FormReply as needed
}

interface CaseWithFormReply {
  participant: any;
  id?: number;
  formReplyId?: number;
  id_swapped?: boolean | null;
  status?: boolean | null;
  reason_rejected?: string | null;
  comment?: string | null;
  reviewedById?: number | null;
  reviewedBy?: string | null;
  reviewedAt?: Date | null;
  formReply?: FormReply | null; // Make formReply optional AND nullable
  hmsFlag: Boolean;
}

export type { CaseWithFormReply, FormReply };

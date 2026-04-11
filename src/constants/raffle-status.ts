export const RAFFLE_STATUS = {
  DRAFT: "DRAFT",
  ACTIVE: "ACTIVE",
  PAUSED: "PAUSED",
  CLOSED: "CLOSED",
  DRAWN: "DRAWN",
  CANCELLED: "CANCELLED",
} as const;

export type RaffleStatus = (typeof RAFFLE_STATUS)[keyof typeof RAFFLE_STATUS];

export const ACTIVE_STATUSES: RaffleStatus[] = [
  RAFFLE_STATUS.ACTIVE,
  RAFFLE_STATUS.PAUSED,
];

export const ENDED_STATUSES: RaffleStatus[] = [
  RAFFLE_STATUS.CLOSED,
  RAFFLE_STATUS.DRAWN,
  RAFFLE_STATUS.CANCELLED,
];

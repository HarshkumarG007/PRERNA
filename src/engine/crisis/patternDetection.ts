
export interface CrisisEvent {
  id: string;
  userId: string;
  detectedAt: Date;
  humanReviewStatus: 'pending' | 'reviewed_no_action' | 'reviewed_resources_only' | 'reviewed_guardian_notified';
  reviewerRef?: string;
  teenInformedAt?: Date;
}

// Deprecated in favor of escalationRouter.ts checkForCrisisIndicators

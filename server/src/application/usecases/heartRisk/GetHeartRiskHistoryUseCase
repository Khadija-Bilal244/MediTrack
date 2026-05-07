/**
 * GetHeartRiskHistoryUseCase
 *
 * Returns all past heart-risk assessments for the authenticated patient,
 * sorted newest-first.
 */
export class GetHeartRiskHistoryUseCase {
  constructor(heartRiskRepository) {
    this.heartRiskRepository = heartRiskRepository;
  }

  async execute({ userId }) {
    return await this.heartRiskRepository.findByUserId(userId);
  }
}

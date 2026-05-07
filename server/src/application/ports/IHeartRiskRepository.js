/**
 * Port — IHeartRiskRepository
 *
 * Defines the contract that any storage adapter must fulfil in order to
 * persist and retrieve HeartRiskAssessment records.
 */
export class IHeartRiskRepository {
  /** Persist a HeartRiskAssessment entity and return the saved document. */
  async save(assessment) {
    throw new Error("IHeartRiskRepository.save() not implemented");
  }

  /** Return all assessments for a given userId, newest first. */
  async findByUserId(userId) {
    throw new Error("IHeartRiskRepository.findByUserId() not implemented");
  }

  /** Return the single most-recent assessment for a userId (or null). */
  async findLatestByUserId(userId) {
    throw new Error("IHeartRiskRepository.findLatestByUserId() not implemented");
  }
}

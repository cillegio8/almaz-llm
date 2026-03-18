export async function checkAndIncrementUsage(
  _userId: string,
  _supabaseUrl: string,
  _serviceRoleKey: string
): Promise<{ allowed: boolean }> {
  return { allowed: true }
}

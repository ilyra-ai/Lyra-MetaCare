import { executeStatement, queryRows } from '@/lib/mysql/pool';
import { UserStreak } from './assessment-engine';
import { RowDataPacket } from 'mysql2';

export async function getUserStreaks(userId: string): Promise<UserStreak[]> {
  const rows = await queryRows<UserStreak & RowDataPacket>(
    'SELECT * FROM user_streaks WHERE user_id = ?',
    [userId]
  );
  return rows;
}

export async function updateUserStreak(
  userId: string,
  streakType: string,
  activityDate: Date
): Promise<void> {
  const activityDateStr = activityDate.toISOString().split('T')[0];

  // Verifica se já existe um streak para o usuário e tipo
  const [existing] = await queryRows<UserStreak & RowDataPacket>(
    'SELECT * FROM user_streaks WHERE user_id = ? AND streak_type = ?',
    [userId, streakType]
  );

  if (!existing) {
    // Primeiro registro do streak
    await executeStatement(
      `INSERT INTO user_streaks (id, user_id, streak_type, current_streak, longest_streak, last_activity_date, created_at, updated_at) 
       VALUES (UUID(), ?, ?, 1, 1, ?, NOW(), NOW())`,
      [userId, streakType, activityDateStr]
    );
    return;
  }

  const lastDate = new Date(existing.last_activity_date);
  const diffTime = Math.abs(activityDate.getTime() - lastDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Já atualizado hoje, nenhuma ação
    return;
  }

  let newCurrent = existing.current_streak;
  let newLongest = existing.longest_streak;

  if (diffDays === 1) {
    // Aderência contínua
    newCurrent += 1;
    if (newCurrent > newLongest) {
      newLongest = newCurrent;
    }
  } else {
    // Quebra do streak (diffDays > 1)
    newCurrent = 1;
  }

  await executeStatement(
    `UPDATE user_streaks 
     SET current_streak = ?, longest_streak = ?, last_activity_date = ?, updated_at = NOW() 
     WHERE id = ?`,
    [newCurrent, newLongest, activityDateStr, existing.id]
  );
}

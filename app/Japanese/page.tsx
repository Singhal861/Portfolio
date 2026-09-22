import { getLearnerProgress } from '@/lib/googleSheets';
import JapaneseHomeContent from '@/components/japanese-home-content';

export const dynamic = 'force-dynamic';

export default async function JapaneseHomePage() {
  let learners: { name: string; count: number }[] = [];

  try {
    const rows = await getLearnerProgress();
    learners = rows.map((row: any) => ({
      name: row.name || '',
      count: Number(row.count || 0)
    }));
  } catch (error) {
    console.error('Learner progress load error', error);
  }

  return <JapaneseHomeContent learners={learners} />;
}

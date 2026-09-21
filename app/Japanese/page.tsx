import { readRows } from '@/lib/googleSheets';
import JapaneseHomeContent from '@/components/japanese-home-content';

export const dynamic = 'force-dynamic';

export default async function JapaneseHomePage() {
  let users: Record<string, string>[] = [];
  let verbs: Record<string, string>[] = [];

  try {
    [users, verbs] = await Promise.all([readRows('Users'), readRows('Verbs')]);
  } catch (error) {
    console.error('Learner progress load error', error);
  }

  const counts = verbs.reduce<Record<string, number>>((result, verb) => {
    const email = String(verb.userEmail || '').trim().toLowerCase();
    if (email && String(verb.Dictionary || '').trim()) {
      result[email] = (result[email] || 0) + 1;
    }
    return result;
  }, {});

  const learners = users
    .filter((user) => String(user.email || '').trim())
    .map((user) => {
      const email = String(user.email).trim().toLowerCase();
      return {
        name: String(user.name || email),
        count: counts[email] || 0,
      };
    });

  return <JapaneseHomeContent learners={learners} />;
}

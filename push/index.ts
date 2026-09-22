// Отправитель уведомлений. Живёт на сервере Supabase (Edge Functions), потому
// что Web Push требует подписать запрос ключом VAPID, а в PostgreSQL этого нет.
//
// Что делает: берёт неотправленные строки из push_outbox, находит подписки
// адресата, собирает текст на его языке и отправляет. Отправленное помечает.
//
// Как поставить — в файле push/README.md рядом.
import webpush from 'npm:web-push@3.6.7';
import { createClient } from 'npm:@supabase/supabase-js@2';

const VAPID_PUBLIC = Deno.env.get('VAPID_PUBLIC')!;
const VAPID_PRIVATE = Deno.env.get('VAPID_PRIVATE')!;
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:admin@example.com';

// Ключи проекта Supabase подставляет сам — руками их сюда вписывать не нужно
const db = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);

// Тексты те же четыре языка, что и в игре. Язык берём из подписки: service
// worker просыпается без страницы и настроек не знает
const TEXT: Record<string, Record<string, (who: string) => [string, string]>> = {
  en: {
    friend_request: w => ['Hot or Cold', `${w} wants to be friends`],
    challenge: w => ['Hot or Cold', `${w} invites you to play`],
    talk: w => ['Hot or Cold', `${w} wrote to you`]
  },
  ru: {
    friend_request: w => ['Горячо-холодно', `${w} хочет дружить`],
    challenge: w => ['Горячо-холодно', `${w} зовёт играть`],
    talk: w => ['Горячо-холодно', `${w} вам написал`]
  },
  fr: {
    friend_request: w => ['Hot or Cold', `${w} veut être votre ami`],
    challenge: w => ['Hot or Cold', `${w} vous invite à jouer`],
    talk: w => ['Hot or Cold', `${w} vous a écrit`]
  },
  de: {
    friend_request: w => ['Hot or Cold', `${w} möchte befreundet sein`],
    challenge: w => ['Hot or Cold', `${w} lädt dich zum Spielen ein`],
    talk: w => ['Hot or Cold', `${w} hat dir geschrieben`]
  }
};

Deno.serve(async () => {
  const { data: rows, error } = await db
    .from('push_outbox')
    .select('id, username, kind, who')
    .is('sent_at', null)
    .order('id')
    .limit(200);
  if (error) return new Response(error.message, { status: 500 });
  if (!rows?.length) return new Response('nothing to send');

  // На один повод одному человеку — одно уведомление, даже если строк больше:
  // десять фраз подряд не должны превратиться в десять всплывающих окон
  const latest = new Map<string, typeof rows[number]>();
  for (const row of rows) latest.set(`${row.username}:${row.kind}`, row);

  let sent = 0;
  for (const row of latest.values()) {
    const { data: subs } = await db
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth, lang')
      .eq('username', row.username);

    for (const sub of subs ?? []) {
      const pack = TEXT[sub.lang] ?? TEXT.ru;
      const [title, body] = (pack[row.kind] ?? pack.talk)(row.who ?? '');
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify({ title, body, tag: `${row.kind}:${row.who}` })
        );
        sent++;
      } catch (e: any) {
        // Устройство отписалось или пропало — подписку убираем, иначе очередь
        // будет вечно спотыкаться об один и тот же мёртвый адрес
        if (e?.statusCode === 404 || e?.statusCode === 410) {
          await db.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
        }
      }
    }
  }

  // Помечаем всё, что взяли, а не только доставленное: иначе строки без
  // подписчиков накапливались бы навсегда
  await db.from('push_outbox')
    .update({ sent_at: new Date().toISOString() })
    .in('id', rows.map(r => r.id));

  return new Response(`sent ${sent}`);
});

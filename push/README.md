# Уведомления: что нужно сделать руками

Игра уже PWA: манифест, иконки и service worker на месте. База копит, кому и о
чём написать. Не хватает одного — того, кто отправит.

У каждого шага подписано, **где** его делать. Ничего из этого не вставляется в
SQL Editor, кроме шагов, прямо помеченных «SQL Editor».

---

## Шаг 1. Миграция

**Где:** Supabase → SQL Editor → вставить `migration_push.txt` целиком → Run.

---

## Шаг 2. Ключи VAPID

Пара ключей: открытый уходит в игру, закрытый остаётся на сервере и нигде
больше.

**Где (с телефона):** откройте на сайте игры адрес `…/push/keys.html` — тот же
адрес, что у игры, плюс `/push/keys.html` в конце. Нажмите «Создать пару
ключей». Ключи считаются прямо в браузере и никуда не отправляются.

**Где (с компьютера, если так привычнее):** в терминале — не в SQL Editor! —
`npx web-push generate-vapid-keys`.

---

## Шаг 3. Открытый ключ — в базу

**Где:** Supabase → SQL Editor.

```sql
update game_config set vapid_public = 'СЮДА_ОТКРЫТЫЙ_КЛЮЧ' where id = 1;
```

Страница из шага 2 показывает эту строку уже с подставленным ключом — её можно
скопировать целиком.

Пока этой строки нет, переключатель уведомлений в игре не показывается вовсе.

---

## Шаг 4. Функция-отправитель

**Где:** Supabase → Edge Functions.

Файл `push/index.ts` в этом репозитории — и есть функция. Назвать её нужно
`push`.

Если в дашборде есть кнопка создать функцию — код вставляется прямо в браузере.
Если такой кнопки нет, понадобится Supabase CLI на компьютере:

```
supabase functions deploy push --project-ref fzakcsvyceqsnowvkxfu
```

Затем в настройках функции задать секреты:

- `VAPID_PUBLIC` — открытый ключ
- `VAPID_PRIVATE` — закрытый ключ
- `VAPID_SUBJECT` — `mailto:` с вашей почтой

`SUPABASE_URL` и `SUPABASE_SERVICE_ROLE_KEY` Supabase подставляет сам — руками
их вписывать не нужно.

---

## Шаг 5. Запускать по расписанию

**Где:** Supabase → SQL Editor.

```sql
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule('push-drain', '* * * * *', $$
  select net.http_post(
    url := 'https://fzakcsvyceqsnowvkxfu.supabase.co/functions/v1/push',
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
$$);
```

Раз в минуту достаточно: уведомления здесь про заявки и приглашения, а не про
ход в идущей партии.

---

## Как проверить, что работает

**Где:** Supabase → SQL Editor.

```sql
select
  case when (select vapid_public from game_config where id = 1) is null
       then '✘ шаг 3 не сделан' else '✔ ключ на месте' end as "ключ",
  (select count(*) from push_subscriptions) as "подписок",
  (select count(*) from push_outbox where sent_at is null) as "ждёт отправки",
  (select count(*) from push_outbox where sent_at is not null) as "отправлено";
```

Если «ждёт отправки» растёт, а «отправлено» стоит на нуле — функция из шага 4
не запускается.

---

## Чего ждать на айфоне

Web Push на iOS работает **только если игру добавили на домашний экран**
(«Поделиться» → «На экран „Домой"»). Это ограничение Apple, обойти нельзя.
Игра говорит об этом словами, если подписка не завелась.

# Уведомления: что нужно сделать руками

Игра уже PWA: манифест, иконки и service worker на месте. База копит, кому и о
чём написать. Не хватает одного — того, кто отправит.

## 1. Ключи VAPID

Пара ключей: открытый уходит в игру, закрытый остаётся на сервере и нигде
больше. Сгенерировать можно где угодно, где есть Node:

```
npx web-push generate-vapid-keys
```

Получится две строки — `Public Key` и `Private Key`.

## 2. Открытый ключ — в базу

В Supabase → SQL Editor:

```sql
update game_config set vapid_public = 'СЮДА_ОТКРЫТЫЙ_КЛЮЧ' where id = 1;
```

Пока этой строки нет, переключатель уведомлений в игре не показывается вовсе.

## 3. Функция-отправитель

Файл `push/index.ts` — это Edge Function для Supabase.

Если в дашборде есть раздел **Edge Functions** с кнопкой создать — можно
вставить код прямо в браузере. Если такой кнопки нет, понадобится Supabase CLI
на компьютере:

```
supabase functions deploy push --project-ref fzakcsvyceqsnowvkxfu
```

Дальше в настройках функции задать секреты:

- `VAPID_PUBLIC` — открытый ключ
- `VAPID_PRIVATE` — закрытый ключ
- `VAPID_SUBJECT` — `mailto:` с вашей почтой

`SUPABASE_URL` и `SUPABASE_SERVICE_ROLE_KEY` Supabase подставляет сам.

## 4. Запускать по расписанию

Функция разбирает очередь за один заход. Чтобы она вызывалась сама, в
SQL Editor:

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

Раз в минуту — достаточно: уведомления здесь про заявки и приглашения, а не
про ход в идущей партии.

## Чего ждать на айфоне

Web Push на iOS работает **только если игру добавили на домашний экран**
(«Поделиться» → «На экран „Домой"»). Это ограничение Apple, обойти нельзя.
Игра об этом говорит словами, если подписка не завелась.

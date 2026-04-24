-- ============================================
-- PicGen 用户系统初始 Schema
-- 基于 Supabase PostgreSQL
-- ============================================

-- 任务元数据表（替代 R2 ListObjects，实现按用户/游客过滤）
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  task_id text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  guest_id text,
  topic text not null,
  page_count int not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_tasks_user_id on tasks(user_id);
create index if not exists idx_tasks_guest_id on tasks(guest_id);
create index if not exists idx_tasks_created_at on tasks(created_at desc);

-- 用户点数表（仅登录用户）
create table if not exists user_credits (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance int not null default 0,
  daily_quota int not null default 3,
  daily_reset_at timestamptz default now(),
  plan_type text not null default 'free' check (plan_type in ('free', 'pro')),
  updated_at timestamptz default now()
);

-- 点数流水表
create table if not exists credit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount int not null,
  type text not null check (type in ('daily_grant', 'consume', 'refund', 'subscription_bonus')),
  description text,
  task_id text,
  created_at timestamptz default now()
);

create index if not exists idx_credit_logs_user_id on credit_logs(user_id);
create index if not exists idx_credit_logs_created_at on credit_logs(created_at desc);

-- Stripe 订阅信息表
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text,
  plan_type text not null default 'free' check (plan_type in ('free', 'pro')),
  current_period_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- 点数操作函数
-- ============================================

-- 检查并重置每日点数（自然日 UTC+8）
create or replace function grant_daily_credits(p_user_id uuid)
returns void
language plpgsql
as $$
declare
  v_now timestamptz := now();
  v_today_start timestamptz := date_trunc('day', v_now at time zone 'Asia/Shanghai') at time zone 'Asia/Shanghai';
  v_record record;
begin
  select * into v_record from user_credits where user_id = p_user_id;

  if not found then
    insert into user_credits (user_id, balance, daily_quota, daily_reset_at, plan_type)
    values (p_user_id, 3, 3, v_now, 'free');
    return;
  end if;

  if v_record.daily_reset_at < v_today_start then
    update user_credits
    set balance = v_record.daily_quota,
        daily_reset_at = v_now,
        updated_at = v_now
    where user_id = p_user_id;

    insert into credit_logs (user_id, amount, type, description)
    values (p_user_id, v_record.daily_quota, 'daily_grant', '每日点数重置');
  end if;
end;
$$;

-- 消费点数（原子操作）
create or replace function consume_credit(p_user_id uuid, p_task_id text)
returns boolean
language plpgsql
as $$
declare
  v_now timestamptz := now();
  v_record record;
begin
  -- 先确保每日点数已刷新
  perform grant_daily_credits(p_user_id);

  select * into v_record from user_credits where user_id = p_user_id for update;

  if not found or v_record.balance <= 0 then
    return false;
  end if;

  update user_credits
  set balance = balance - 1,
      updated_at = v_now
  where user_id = p_user_id;

  insert into credit_logs (user_id, amount, type, description, task_id)
  values (p_user_id, -1, 'consume', 'AI 生成消费', p_task_id);

  return true;
end;
$$;

-- 回滚点数（生成失败时使用）
create or replace function refund_credit(p_user_id uuid, p_task_id text)
returns void
language plpgsql
as $$
declare
  v_now timestamptz := now();
begin
  -- 使用 FOR UPDATE 防止并发回滚导致余额异常
  perform 1 from user_credits where user_id = p_user_id for update;

  update user_credits
  set balance = balance + 1,
      updated_at = v_now
  where user_id = p_user_id;

  insert into credit_logs (user_id, amount, type, description, task_id)
  values (p_user_id, 1, 'refund', 'AI 生成失败回滚', p_task_id);
end;
$$;

-- 获取用户点数信息
create or replace function get_user_credit_info(p_user_id uuid)
returns table(balance int, daily_quota int, daily_reset_at timestamptz, plan_type text)
language plpgsql
as $$
begin
  perform grant_daily_credits(p_user_id);
  return query select uc.balance, uc.daily_quota, uc.daily_reset_at, uc.plan_type
               from user_credits uc where uc.user_id = p_user_id;
end;
$$;

-- ============================================
-- 触发器：新用户注册时自动创建点数记录
-- ============================================
create or replace function handle_new_user()
returns trigger
language plpgsql
as $$
begin
  insert into user_credits (user_id, balance, daily_quota, daily_reset_at, plan_type)
  values (new.id, 3, 3, now(), 'free')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

-- 监听 Supabase Auth 的 users 表（通过 trigger 或 webhook）
-- 注意：auth.users 表的 trigger 需要 superuser 权限，建议在 Supabase Dashboard 中
-- 通过 "Database Triggers" 界面手动创建，或启用 Supabase Auth 的 webhook
-- 这里提供 SQL 作为参考（可能因权限无法直接执行）：
-- create trigger on_auth_user_created
--   after insert on auth.users
--   for each row execute function handle_new_user();

-- 如果无法在 auth.users 上创建 trigger，可以在应用层首次调用时惰性初始化（已包含在 grant_daily_credits 中）

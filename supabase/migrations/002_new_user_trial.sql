-- ============================================
-- 新用户注册自动获得 7 天 Pro 试用
-- ============================================

-- 1. 为 credit_logs.type 添加 trial_bonus 类型
ALTER TABLE credit_logs DROP CONSTRAINT IF EXISTS credit_logs_type_check;
ALTER TABLE credit_logs ADD CONSTRAINT credit_logs_type_check
  CHECK (type IN ('daily_grant', 'consume', 'refund', 'subscription_bonus', 'onetime_bonus', 'trial_bonus'));

-- 2. 更新 handle_new_user：新用户直接获得 7 天 Pro 试用（100 点/天）
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_trial_expires timestamptz := now() + interval '7 days';
BEGIN
  INSERT INTO user_credits (user_id, balance, daily_quota, daily_reset_at, plan_type, plan_expires_at)
  VALUES (new.id, 100, 100, now(), 'pro', v_trial_expires)
  ON CONFLICT (user_id) DO NOTHING;

  IF FOUND THEN
    INSERT INTO credit_logs (user_id, amount, type, description)
    VALUES (new.id, 100, 'trial_bonus', '新用户7天Pro试用');
  END IF;

  RETURN new;
END;
$$;

-- 3. 更新 grant_daily_credits：惰性初始化时同样给予 Pro 试用（兜底，防止 trigger 未配置）
CREATE OR REPLACE FUNCTION grant_daily_credits(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_now timestamptz := now();
  v_today_start timestamptz := date_trunc('day', v_now AT TIME ZONE 'Asia/Shanghai') AT TIME ZONE 'Asia/Shanghai';
  v_trial_expires timestamptz := v_now + interval '7 days';
  v_record record;
BEGIN
  SELECT * INTO v_record FROM user_credits WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    -- 新用户首次触发：给予 7 天 Pro 试用
    INSERT INTO user_credits (user_id, balance, daily_quota, daily_reset_at, plan_type, plan_expires_at)
    VALUES (p_user_id, 100, 100, v_now, 'pro', v_trial_expires)
    ON CONFLICT (user_id) DO NOTHING;

    IF FOUND THEN
      INSERT INTO credit_logs (user_id, amount, type, description)
      VALUES (p_user_id, 100, 'trial_bonus', '新用户7天Pro试用');
    END IF;
    RETURN;
  END IF;

  -- Pro 试用/会员过期自动降级为 free
  IF v_record.plan_type = 'pro'
     AND v_record.plan_expires_at IS NOT NULL
     AND v_record.plan_expires_at < v_now THEN
    UPDATE user_credits
    SET plan_type = 'free',
        daily_quota = 3,
        plan_expires_at = NULL,
        updated_at = v_now
    WHERE user_id = p_user_id;
    SELECT * INTO v_record FROM user_credits WHERE user_id = p_user_id;
  END IF;

  IF v_record.daily_reset_at < v_today_start THEN
    UPDATE user_credits
    SET balance = v_record.daily_quota,
        daily_reset_at = v_now,
        updated_at = v_now
    WHERE user_id = p_user_id;

    INSERT INTO credit_logs (user_id, amount, type, description)
    VALUES (p_user_id, v_record.daily_quota, 'daily_grant', '每日点数重置');
  END IF;
END;
$$;

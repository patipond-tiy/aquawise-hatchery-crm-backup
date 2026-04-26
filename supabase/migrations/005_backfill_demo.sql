-- Demo hatchery never expires — pin to active subscription state for local dev/demo.
update public.hatcheries
   set subscription_status = 'active',
       trial_ends_at = null,
       subscription_current_period_end = now() + interval '30 days'
 where id = '00000000-0000-0000-0000-00000000aaaa';

update public.free_account_usage
set product_count = 5,
    updated_at = now()
where product_count > 5;

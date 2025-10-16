CREATE OR REPLACE FUNCTION get_data_health_metrics()
RETURNS TABLE(metric_name TEXT, fill_rate REAL, avg_value REAL, min_value REAL, max_value REAL)
LANGUAGE plpgsql
AS $$
DECLARE
    metric_column RECORD;
BEGIN
    FOR metric_column IN 
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'daily_metrics'
          AND data_type IN ('integer', 'real', 'numeric', 'double precision')
          AND column_name NOT IN ('user_id') -- Excluir colunas que não são métricas
    LOOP
        RETURN QUERY EXECUTE format(
            'SELECT 
                %L AS metric_name,
                (COUNT(%I)::DECIMAL / COUNT(*)) * 100 AS fill_rate,
                AVG(%I)::REAL AS avg_value,
                MIN(%I)::REAL AS min_value,
                MAX(%I)::REAL AS max_value
             FROM public.daily_metrics',
            metric_column.column_name,
            metric_column.column_name,
            metric_column.column_name,
            metric_column.column_name,
            metric_column.column_name
        );
    END LOOP;
END;
$$;
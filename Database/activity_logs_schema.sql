-- ==========================================
-- MarketMind AI Database Schema - Activity & Security Logs
-- Module: Security & API Gateway (Milestone 2 Day 6)
-- ==========================================

CREATE TABLE IF NOT EXISTS activity_logs (
    log_id SERIAL PRIMARY KEY,
    user_id INTEGER,
    endpoint VARCHAR(255) NOT NULL,
    http_method VARCHAR(10) NOT NULL,
    response_status INTEGER NOT NULL,
    execution_time_ms NUMERIC(10,2) DEFAULT 0,
    client_ip VARCHAR(50),
    event_type VARCHAR(50) DEFAULT 'API_REQUEST',
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_log_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_event_type ON activity_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);

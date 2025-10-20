-- MixMyAI Database Initialization

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    priority VARCHAR(20) DEFAULT 'medium',
    user_id VARCHAR(255) NOT NULL,
    final_answer TEXT,
    revision_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    estimated_duration INTEGER,
    actual_duration INTEGER
);

-- Agents table
CREATE TABLE IF NOT EXISTS agents (
    id VARCHAR(255) PRIMARY KEY,
    task_id VARCHAR(255) REFERENCES tasks(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50),
    status VARCHAR(50) DEFAULT 'idle',
    current_action TEXT,
    progress INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subtasks table
CREATE TABLE IF NOT EXISTS subtasks (
    id VARCHAR(255) PRIMARY KEY,
    task_id VARCHAR(255) REFERENCES tasks(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    assigned_to VARCHAR(255) REFERENCES agents(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'pending',
    solution TEXT,
    is_accepted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Solutions table
CREATE TABLE IF NOT EXISTS solutions (
    id VARCHAR(255) PRIMARY KEY,
    subtask_id VARCHAR(255) REFERENCES subtasks(id) ON DELETE CASCADE,
    agent_id VARCHAR(255) REFERENCES agents(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    confidence FLOAT DEFAULT 0.8,
    is_accepted BOOLEAN DEFAULT FALSE,
    review_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Revision requests table
CREATE TABLE IF NOT EXISTS revision_requests (
    id VARCHAR(255) PRIMARY KEY,
    task_id VARCHAR(255) REFERENCES tasks(id) ON DELETE CASCADE,
    feedback TEXT NOT NULL,
    requested_by VARCHAR(255) NOT NULL,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events table (for activity log)
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    task_id VARCHAR(255) REFERENCES tasks(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    message TEXT,
    data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);
CREATE INDEX idx_agents_task_id ON agents(task_id);
CREATE INDEX idx_subtasks_task_id ON subtasks(task_id);
CREATE INDEX idx_events_task_id ON events(task_id);

-- Initial demo data (optional)
-- INSERT INTO tasks (id, title, description, user_id, priority) VALUES
-- ('demo_task_1', 'Разработать мобильное приложение', 'Создать iOS/Android приложение для онлайн-магазина с корзиной и оплатой', 'user_demo', 'high');

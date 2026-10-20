-- Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla: users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'operator' CHECK (role IN ('admin','supervisor','operator')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Tabla: stations
CREATE TABLE stations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    process_order INTEGER NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Tabla: parts
CREATE TABLE parts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    current_station_id UUID REFERENCES stations(id),
    status VARCHAR(20) NOT NULL DEFAULT 'in_process' CHECK (status IN ('in_process','completed','rejected','scrap')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Tabla: movements
CREATE TABLE movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    part_id UUID NOT NULL REFERENCES parts(id),
    from_station_id UUID REFERENCES stations(id),
    to_station_id UUID REFERENCES stations(id),
    operator_id UUID NOT NULL REFERENCES users(id),
    movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('entry','exit','transfer','quality_reject','quality_approve')),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    observations TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: quality_events
CREATE TABLE quality_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    part_id UUID NOT NULL REFERENCES parts(id),
    movement_id UUID NOT NULL REFERENCES movements(id),
    result VARCHAR(10) NOT NULL CHECK (result IN ('approved','rejected')),
    rejection_reason TEXT,
    evidence_url TEXT,
    operator_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: audit_logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('create','update','delete')),
    old_values JSONB,
    new_values JSONB,
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: critical_events
CREATE TABLE critical_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    part_id UUID REFERENCES parts(id),
    user_id UUID REFERENCES users(id),
    severity VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (severity IN ('low','medium','high','critical')),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_parts_serial ON parts(serial_number);
CREATE INDEX idx_parts_current_station ON parts(current_station_id);
CREATE INDEX idx_parts_status ON parts(status);
CREATE INDEX idx_movements_part ON movements(part_id);
CREATE INDEX idx_movements_timestamp ON movements(timestamp);
CREATE INDEX idx_movements_operator ON movements(operator_id);
CREATE INDEX idx_movements_from_station ON movements(from_station_id);
CREATE INDEX idx_movements_to_station ON movements(to_station_id);
CREATE INDEX idx_quality_part ON quality_events(part_id);
CREATE INDEX idx_quality_movement ON quality_events(movement_id);
CREATE INDEX idx_audit_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_critical_events_timestamp ON critical_events(timestamp);
CREATE INDEX idx_critical_events_part ON critical_events(part_id);
CREATE INDEX idx_users_username ON users(username);
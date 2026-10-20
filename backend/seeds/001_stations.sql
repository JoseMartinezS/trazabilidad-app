-- Estaciones de ejemplo para el flujo: Corte → Maquinado → Soldadura → Pintura → Ensamble → Inspección final
INSERT INTO stations (name, code, process_order, description) VALUES
('Corte', 'ST-01', 1, 'Corte de materia prima'),
('Maquinado', 'ST-02', 2, 'Maquinado CNC'),
('Soldadura', 'ST-03', 3, 'Soldadura de piezas'),
('Pintura', 'ST-04', 4, 'Pintura y acabado'),
('Ensamble', 'ST-05', 5, 'Ensamble final'),
('Inspección Final', 'ST-06', 6, 'Control de calidad final');
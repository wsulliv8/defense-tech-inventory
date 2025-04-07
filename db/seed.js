const pool = require("./pool");

const categories_SQL = `
  CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      description TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

  INSERT INTO categories (name, description) VALUES
      ('Drones', 'Unmanned aerial vehicles for surveillance and combat'),
      ('Sensors', 'Detection and environmental monitoring systems'),
      ('Vehicles', 'Ground-based autonomous or manned platforms')
  ON CONFLICT (name) DO NOTHING;
`;

const product_SQL = `
  CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    part_number VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) NOT NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

  INSERT INTO products (name, description, part_number, status) VALUES
    ('Advanced Drone', 'High-precision surveillance drone', 'DRONE-X1', 'IN_PRODUCTION'),
    ('Tactical Sensor Array', 'Multi-spectrum environmental sensor system', 'SENSOR-T2', 'PROTOTYPE'),
    ('Autonomous Ground Vehicle', 'Unmanned ground reconnaissance platform', 'AGV-R3', 'IN_PRODUCTION')
  ON CONFLICT (name) DO NOTHING;
`;

const materials_SQL = `
  CREATE TABLE IF NOT EXISTS materials (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    current_stock DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    supplier VARCHAR(255),
    unit_cost DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

  INSERT INTO materials (name, description, current_stock, unit, supplier, unit_cost) VALUES
    ('Carbon Fiber Composite', 'High-strength lightweight material', 500.50, 'kg', 'Advanced Composites Inc.', 45.75),
    ('Aluminum Alloy Plate', 'Aerospace-grade aluminum sheet', 1000.25, 'kg', 'Metal Dynamics Corp', 12.50),
    ('High-Precision Sensor Module', 'Advanced multi-spectrum sensor', 75.00, 'pieces', 'SensorTech Solutions', 875.00),
    ('Lithium-Polymer Battery Pack', 'High-capacity rechargeable battery', 200.75, 'pieces', 'PowerCell Technologies', 325.50)
  ON CONFLICT (name) DO NOTHING;
`;
const product_materials_SQL = `
  CREATE TABLE IF NOT EXISTS product_materials (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id),
    material_id INTEGER REFERENCES materials(id),
    quantity_required DECIMAL(10, 2) NOT NULL,
    notes TEXT,
    UNIQUE(product_id, material_id)
  );

  INSERT INTO product_materials (product_id, material_id, quantity_required, notes) VALUES
    (
      (SELECT id FROM products WHERE part_number = 'DRONE-X1'),
      (SELECT id FROM materials WHERE name = 'Carbon Fiber Composite'),
      25.5,
      'Structural frame components'
    ),
    (
      (SELECT id FROM products WHERE part_number = 'DRONE-X1'),
      (SELECT id FROM materials WHERE name = 'Lithium-Polymer Battery Pack'),
      2,
      'Power supply system'
    ),
    (
      (SELECT id FROM products WHERE part_number = 'SENSOR-T2'),
      (SELECT id FROM materials WHERE name = 'High-Precision Sensor Module'),
      1,
      'Primary sensor array'
    ),
    (
      (SELECT id FROM products WHERE part_number = 'AGV-R3'),
      (SELECT id FROM materials WHERE name = 'Aluminum Alloy Plate'),
      40.75,
      'Chassis and body panels'
    )
  ON CONFLICT (product_id, material_id) DO NOTHING;
`;

async function seedDatabase() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query(categories_SQL);
    await client.query(product_SQL);
    await client.query(materials_SQL);
    await client.query(product_materials_SQL);

    await client.query("COMMIT");
    console.log("Database Seeded Successfully");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error seeding database: ", err);
    throw err;
  } finally {
    client.release();
  }
}

module.exports = seedDatabase;

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

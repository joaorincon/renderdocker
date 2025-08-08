// To run this server, you need Node.js and npm.
// 1. Run `npm install` to install dependencies from package.json.
// 2. Create a .env file in this directory with your database credentials:
//    DB_USER=prod_app_owner
//    DB_HOST=localhost
//    DB_DATABASE=implameq_prod_db
//    DB_PASSWORD=Implameq21
//    DB_PORT=5432
//    PORT=3001
// 3. Run `npm start` to start the server.

require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();
const port = process.env.PORT || 3001;

// --- Start of new code: Environment variable validation ---
const requiredEnvVars = ['DB_USER', 'DB_HOST', 'DB_DATABASE', 'DB_PASSWORD', 'DB_PORT'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`\nERROR: The following required environment variables are missing from your .env file: ${missingEnvVars.join(', ')}`);
  console.error('Please create or complete the .env file in the project root and restart the server.\n');
  process.exit(1); // Exit the process with an error code
}
// --- End of new code ---

// Middleware
app.use(cors());
app.use(express.json());

// --- AÑADE ESTAS LÍNEAS PARA DEPURAR ---
console.log("--- DEBUGGING ENVIRONMENT VARIABLES ---");
console.log("DB_HOST from env:", process.env.DB_HOST);
console.log("DB_USER from env:", process.env.DB_USER);
console.log("DB_DATABASE from env:", process.env.DB_DATABASE);
console.log("DB_PORT from env:", process.env.DB_PORT);
console.log("--- END DEBUGGING ---");
// -----------------------------------------

// DB Connection Pool
// It's crucial to use environment variables for database credentials.
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT, 10),
});

// Test DB connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to the database. Make sure your credentials in .env are correct.', err.stack);
  } else {
    console.log('Database connected successfully.');
  }
});

// API Routes
app.post('/api/login', async (req, res) => {
  const { codigo_operario, pin } = req.body;

  if (!codigo_operario || !pin) {
    return res.status(400).json({ message: 'Se requieren usuario y PIN.' });
  }

  try {
    const query = `
      SELECT u.id, u.codigo_operario, u.password_hash, r.nombre_rol
      FROM produccion.users u 
      JOIN maestros.roles r ON u.role_id = r.id 
      WHERE u.codigo_operario = $1
    `;
    const { rows } = await pool.query(query, [codigo_operario]);

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    const user = rows[0];

    // Passwords in `password_hash` column MUST be hashed using bcrypt.
    // If they are plain text, this comparison will always fail.
    const isPasswordValid = await bcrypt.compare(pin, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    // Determine role for the frontend
    const role = user.nombre_rol ? user.nombre_rol.toLowerCase().replace(/\s+/g, '_') : 'operario';

    res.json({
      message: 'Inicio de sesión exitoso',
      user: {
        id: user.id,
        codigo_operario: user.codigo_operario,
        role: role,
      },
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Ocurrió un error interno en el servidor.' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const query = `
      SELECT
          u.id,
          u.nombre_completo,
          u.codigo_operario,
          r.nombre_rol,
          u.is_active
      FROM
          produccion.users u
      JOIN
          maestros.roles r ON u.role_id = r.id
      ORDER BY
          u.is_active DESC, u.nombre_completo ASC;
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Ocurrió un error interno al obtener los usuarios.' });
  }
});

app.post('/api/users', async (req, res) => {
  const { nombre_completo, codigo_operario, rol, pin } = req.body;

  if (!nombre_completo || !codigo_operario || !rol || !pin) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
  }

  if (pin.length < 3) {
    return res.status(400).json({ message: 'La contraseña / PIN debe tener al menos 3 caracteres.' });
  }

  try {
    // Check if user already exists
    const existingUser = await pool.query('SELECT id FROM produccion.users WHERE codigo_operario = $1', [codigo_operario]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: 'El código de operario ya existe.' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(pin, salt);

    // Map role name to role_id (assuming 1: operario, 2: supervisor from a `maestros.roles` table)
    const roleResult = await pool.query('SELECT id FROM maestros.roles WHERE nombre_rol ILIKE $1', [rol]);
    if (roleResult.rows.length === 0) {
      return res.status(400).json({ message: 'El rol especificado no es válido.' });
    }
    const role_id = roleResult.rows[0].id;

    // Insert new user
    const insertQuery = `
            INSERT INTO produccion.users (nombre_completo, codigo_operario, role_id, password_hash)
            VALUES ($1, $2, $3, $4)
            RETURNING id, nombre_completo, codigo_operario, is_active;
        `;
    const newUserResult = await pool.query(insertQuery, [nombre_completo, codigo_operario, role_id, password_hash]);
    const newUser = {
      ...newUserResult.rows[0],
      nombre_rol: rol
    };

    res.status(201).json(newUser);

  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Ocurrió un error interno al crear el usuario.' });
  }
});

// NOTE: This route MUST come before /api/users/:id to be matched correctly
app.put('/api/users/change-password', async (req, res) => {
  const { codigo_operario, currentPin, newPin } = req.body;

  if (!codigo_operario || !currentPin || !newPin) {
    return res.status(400).json({ message: 'Se requieren el código de operario, el PIN actual y el PIN nuevo.' });
  }
  if (newPin.length < 3) {
    return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 3 caracteres.' });
  }

  try {
    // Find user by codigo_operario
    const userQuery = 'SELECT id, password_hash FROM produccion.users WHERE codigo_operario = $1';
    const { rows } = await pool.query(userQuery, [codigo_operario]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }
    const user = rows[0];

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPin, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'El PIN actual es incorrecto.' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPin, salt);

    // Update password in DB
    const updateQuery = 'UPDATE produccion.users SET password_hash = $1 WHERE id = $2';
    await pool.query(updateQuery, [newPasswordHash, user.id]);

    res.status(200).json({ message: 'Contraseña actualizada correctamente.' });

  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Ocurrió un error interno al cambiar la contraseña.' });
  }
});

app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { rol, is_active, pin, updated_by_id } = req.body;

  if (!id || isNaN(parseInt(id, 10))) {
    return res.status(400).json({ message: 'Se requiere un ID de usuario válido.' });
  }

  if (typeof rol !== 'string' || typeof is_active !== 'boolean') {
    return res.status(400).json({ message: 'Los campos "rol" y "is_active" son obligatorios y deben tener el formato correcto.' });
  }

  if (!updated_by_id) {
    return res.status(400).json({ message: 'No se ha proporcionado el ID del usuario que realiza la modificación.' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query("SELECT pg_catalog.set_config('session.user_id', $1, true)", [updated_by_id]);

    const roleResult = await client.query('SELECT id FROM maestros.roles WHERE nombre_rol ILIKE $1', [rol]);
    if (roleResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'El rol especificado no es válido.' });
    }
    const role_id = roleResult.rows[0].id;

    const queryParts = ['role_id = $1', 'is_active = $2'];
    const queryParams = [role_id, is_active];
    let paramIndex = 3;

    if (pin && typeof pin === 'string' && pin.trim() !== '') {
      if (pin.length < 3) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 3 caracteres.' });
      }
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(pin, salt);
      queryParts.push(`password_hash = $${paramIndex}`);
      queryParams.push(password_hash);
      paramIndex++;
    }

    const updateQuery = `
            UPDATE produccion.users
            SET ${queryParts.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING id, nombre_completo, codigo_operario, is_active;
        `;
    queryParams.push(id);

    const updatedUserResult = await client.query(updateQuery, queryParams);

    if (updatedUserResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    const updatedUser = {
      ...updatedUserResult.rows[0],
      nombre_rol: rol
    };

    await client.query('COMMIT');
    res.status(200).json(updatedUser);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Ocurrió un error interno al actualizar el usuario.' });
  } finally {
    client.release();
  }
});

app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { deleted_by_id } = req.body;

  if (!id || isNaN(parseInt(id, 10))) {
    return res.status(400).json({ message: 'Se requiere un ID de usuario válido.' });
  }

  if (!deleted_by_id) {
    return res.status(400).json({ message: 'No se ha proporcionado el ID del usuario que realiza la eliminación.' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query("SELECT pg_catalog.set_config('session.user_id', $1, true)", [deleted_by_id]);

    const deleteQuery = 'DELETE FROM produccion.users WHERE id = $1 RETURNING id;';
    const result = await client.query(deleteQuery, [id]);

    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    await client.query('COMMIT');
    res.status(200).json({ message: 'Usuario eliminado correctamente.' });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Ocurrió un error interno al eliminar el usuario.' });
  } finally {
    client.release();
  }
});

app.get('/api/roles', async (req, res) => {
  try {
    const query = `
      SELECT nombre_rol FROM maestros.roles ORDER BY nombre_rol ASC;
    `;
    const { rows } = await pool.query(query);
    const roleNames = rows.map(row => row.nombre_rol);
    res.json(roleNames);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ message: 'Ocurrió un error interno al obtener los roles.' });
  }
});

// GET all active users with the 'operario' role
app.get('/api/users/operators', async (req, res) => {
  try {
    const query = `
      SELECT
          u.id,
          u.codigo_operario,
          u.nombre_completo
      FROM
          produccion.users u
      JOIN
          maestros.roles r ON u.role_id = r.id
      WHERE
          LOWER(r.nombre_rol) = 'operario' AND u.is_active = true
      ORDER BY
          u.nombre_completo ASC;
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching operators:', error);
    res.status(500).json({ message: 'Ocurrió un error interno al obtener los operarios.' });
  }
});


// === Downtime Reasons API (Refactored for new schema) ===

// GET reasons for operator selection page
app.get('/api/downtime/reasons', async (req, res) => {
  try {
    const query = `
      SELECT
        dr.id,
        dr.codigo,
        drc.nombre_categoria AS categoria,
        dr.nombre_causa
      FROM
        maestros.downtime_reasons dr
      JOIN
        maestros.downtime_reasons_categories drc ON dr.downtime_reasons_categories_id = drc.id
      WHERE
        dr.is_active = true
      ORDER BY
        drc.nombre_categoria, dr.nombre_causa;
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching downtime reasons:', error);
    res.status(500).json({ message: 'Ocurrió un error interno al obtener las causas de inactividad.' });
  }
});

// GET all reasons with full details for management page
app.get('/api/downtime/management-data', async (req, res) => {
  try {
    const query = `
      SELECT
        dr.id,
        dr.codigo,
        drc.nombre_categoria AS categoria,
        dr.downtime_reasons_categories_id,
        dr.nombre_causa,
        dr.descripcion,
        dr.is_active
      FROM
        maestros.downtime_reasons dr
      LEFT JOIN
        maestros.downtime_reasons_categories drc ON dr.downtime_reasons_categories_id = drc.id
      ORDER BY
        drc.nombre_categoria, dr.nombre_causa;
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching downtime management data:', error);
    res.status(500).json({ message: 'Ocurrió un error interno al obtener los datos de gestión.' });
  }
});

// POST a new reason
app.post('/api/downtime/reasons', async (req, res) => {
  const { codigo, nombre_causa, descripcion, downtime_reasons_categories_id } = req.body;
  if (!codigo || !nombre_causa || !downtime_reasons_categories_id) {
    return res.status(400).json({ message: 'Se requieren código, nombre de la causa y ID de categoría.' });
  }
  try {
    const query = `
      INSERT INTO maestros.downtime_reasons (codigo, nombre_causa, descripcion, downtime_reasons_categories_id, is_active)
      VALUES ($1, $2, $3, $4, true)
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [codigo, nombre_causa, descripcion, downtime_reasons_categories_id]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating downtime reason:', error);
    res.status(500).json({ message: 'Ocurrió un error interno al crear la causa.' });
  }
});

// PUT (update) a reason
app.put('/api/downtime/reasons/:id', async (req, res) => {
  const { id } = req.params;
  const { codigo, nombre_causa, descripcion, downtime_reasons_categories_id, is_active } = req.body;
  if (!codigo || !nombre_causa || !downtime_reasons_categories_id || typeof is_active !== 'boolean') {
    return res.status(400).json({ message: 'Se requieren todos los campos con el formato correcto.' });
  }
  try {
    const query = `
      UPDATE maestros.downtime_reasons
      SET codigo = $1, nombre_causa = $2, descripcion = $3, downtime_reasons_categories_id = $4, is_active = $5
      WHERE id = $6
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [codigo, nombre_causa, descripcion, downtime_reasons_categories_id, is_active, id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Causa no encontrada.' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating downtime reason:', error);
    res.status(500).json({ message: 'Ocurrió un error interno al actualizar la causa.' });
  }
});

// DELETE a reason
app.delete('/api/downtime/reasons/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM maestros.downtime_reasons WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Causa no encontrada.' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting downtime reason:', error);
    res.status(500).json({ message: 'Ocurrió un error interno al eliminar la causa.' });
  }
});


// === Downtime Categories API (New) ===

// GET all categories
app.get('/api/downtime/categories', async (req, res) => {
  try {
    const query = 'SELECT id, nombre_categoria, descripcion FROM maestros.downtime_reasons_categories ORDER BY nombre_categoria;';
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Ocurrió un error interno al obtener las categorías.' });
  }
});

// POST a new category
app.post('/api/downtime/categories', async (req, res) => {
  const { nombre_categoria, descripcion } = req.body;
  if (!nombre_categoria) {
    return res.status(400).json({ message: 'Se requiere el nombre de la categoría.' });
  }
  try {
    const query = `
            INSERT INTO maestros.downtime_reasons_categories (nombre_categoria, descripcion)
            VALUES ($1, $2)
            RETURNING id, nombre_categoria, descripcion;
        `;
    const { rows } = await pool.query(query, [nombre_categoria, descripcion]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Ocurrió un error interno al crear la categoría.' });
  }
});

// PUT (update) a category
app.put('/api/downtime/categories/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre_categoria, descripcion } = req.body;
  if (!nombre_categoria) {
    return res.status(400).json({ message: 'Se requiere el nombre de la categoría.' });
  }
  try {
    const query = `
            UPDATE maestros.downtime_reasons_categories
            SET nombre_categoria = $1, descripcion = $2
            WHERE id = $3
            RETURNING id, nombre_categoria, descripcion;
        `;
    const { rows } = await pool.query(query, [nombre_categoria, descripcion, id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Categoría no encontrada.' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Ocurrió un error interno al actualizar la categoría.' });
  }
});

// DELETE a category
app.delete('/api/downtime/categories/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM maestros.downtime_reasons_categories WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Categoría no encontrada.' });
    }
    res.status(204).send();
  } catch (error) {
    if (error.code === '23503') { // Foreign key violation
      return res.status(409).json({ message: 'No se puede eliminar la categoría porque tiene causas de inactividad asociadas. Por favor, reasigne o elimine primero esas causas.' });
    }
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Ocurrió un error interno al eliminar la categoría.' });
  }
});

// === Work Centers (Machines) API ===

// GET all machines
app.get('/api/machines', async (req, res) => {
  const { activeOnly } = req.query; // e.g., /api/machines?activeOnly=true
  try {
    let query = `
      SELECT id, codigo, nombre, descripcion, is_active 
      FROM maestros.work_centers
    `;

    if (activeOnly === 'true') {
      query += ' WHERE is_active = true';
    }

    query += ' ORDER BY nombre ASC;';

    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching machines:', error);
    res.status(500).json({ message: 'Ocurrió un error interno al obtener las máquinas.' });
  }
});

// POST a new machine
app.post('/api/machines', async (req, res) => {
  const { codigo, nombre, descripcion, is_active } = req.body;
  if (!codigo || !nombre) {
    return res.status(400).json({ message: 'Se requieren código y nombre.' });
  }
  try {
    const query = `
      INSERT INTO maestros.work_centers (codigo, nombre, descripcion, is_active)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [codigo, nombre, descripcion, is_active ?? true]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating machine:', error);
    if (error.code === '23505') { // unique constraint violation
      return res.status(409).json({ message: 'El código de la máquina ya existe.' });
    }
    res.status(500).json({ message: 'Ocurrió un error interno al crear la máquina.' });
  }
});

// PUT (update) a machine
app.put('/api/machines/:id', async (req, res) => {
  const { id } = req.params;
  const { codigo, nombre, descripcion, is_active } = req.body;
  if (!codigo || !nombre || typeof is_active !== 'boolean') {
    return res.status(400).json({ message: 'Se requieren todos los campos con el formato correcto.' });
  }
  try {
    const query = `
      UPDATE maestros.work_centers
      SET codigo = $1, nombre = $2, descripcion = $3, is_active = $4
      WHERE id = $5
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [codigo, nombre, descripcion, is_active, id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Máquina no encontrada.' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating machine:', error);
    if (error.code === '23505') { // unique constraint violation
      return res.status(409).json({ message: 'El código de la máquina ya existe.' });
    }
    res.status(500).json({ message: 'Ocurrió un error interno al actualizar la máquina.' });
  }
});

// DELETE a machine
app.delete('/api/machines/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM maestros.work_centers WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Máquina no encontrada.' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting machine:', error);
    res.status(500).json({ message: 'Ocurrió un error interno al eliminar la máquina.' });
  }
});


// === Products API ===
app.get('/api/products', async (req, res) => {
  try {
    const query = 'SELECT id, nombre FROM maestros.products WHERE is_active = true ORDER BY nombre;';
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Ocurrió un error interno al obtener los productos.' });
  }
});

// === Product Operations API ===
app.get('/api/products/:productId/operations', async (req, res) => {
  const { productId } = req.params;

  if (!productId || isNaN(parseInt(productId, 10))) {
    return res.status(400).json({ message: 'Se requiere un ID de producto válido.' });
  }

  try {
    const query = `
            SELECT id, nombre_operacion, secuencia, tiempo_estandar_segundos
            FROM maestros.product_operations
            WHERE product_id = $1
            ORDER BY secuencia ASC;
        `;
    const { rows } = await pool.query(query, [productId]);
    res.json(rows);
  } catch (error) {
    console.error(`Error fetching operations for product ${productId}:`, error);
    res.status(500).json({ message: 'Ocurrió un error interno al obtener las operaciones del producto.' });
  }
});


// === Production Orders API ===

// POST a new production order
app.post('/api/production-orders', async (req, res) => {
  const { orden_numero, product_id, cantidad_requerida, fecha_inicio_programada, created_by_id } = req.body;

  if (!orden_numero || !product_id || !cantidad_requerida || !fecha_inicio_programada || !created_by_id) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios para crear la orden.' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query("SELECT pg_catalog.set_config('session.user_id', $1, true)", [created_by_id]);

    // Check for duplicate order number
    const existingOrder = await client.query('SELECT id FROM produccion.production_orders WHERE orden_numero = $1', [orden_numero]);
    if (existingOrder.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ message: 'El número de orden ya existe.' });
    }

    const insertQuery = `
            INSERT INTO produccion.production_orders 
            (orden_numero, product_id, cantidad_requerida, fecha_inicio_programada, created_by_id, estado)
            VALUES ($1, $2, $3, $4, $5, 'Programada')
            RETURNING id, orden_numero, product_id, cantidad_requerida, fecha_inicio_programada, estado, created_by_id, created_at;
        `;

    const result = await client.query(insertQuery, [orden_numero, product_id, cantidad_requerida, fecha_inicio_programada, created_by_id]);

    const newOrder = result.rows[0];

    // Fetch product name for response
    const productResult = await client.query('SELECT nombre FROM maestros.products WHERE id = $1', [newOrder.product_id]);
    const productName = productResult.rows.length > 0 ? productResult.rows[0].nombre : 'Producto Desconocido';

    await client.query('COMMIT');

    res.status(201).json({
      ...newOrder,
      product_name: productName
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating production order:', error);
    res.status(500).json({ message: 'Ocurrió un error interno al crear la orden de producción.' });
  } finally {
    client.release();
  }
});


// GET all production orders with details
app.get('/api/production-orders', async (req, res) => {
  try {
    const query = `
            SELECT
                po.id,
                po.orden_numero,
                p.nombre AS product_name,
                po.cantidad_requerida,
                po.fecha_inicio_programada,
                po.estado,
                u.nombre_completo AS created_by,
                po.created_at
            FROM
                produccion.production_orders po
            JOIN
                maestros.products p ON po.product_id = p.id
            JOIN
                produccion.users u ON po.created_by_id = u.id
            ORDER BY
                po.created_at DESC;
        `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching production orders:', error);
    res.status(500).json({ message: 'Ocurrió un error interno al obtener las órdenes de producción.' });
  }
});


// GET selectable production orders (Programada status) for task creation
app.get('/api/production-orders/selectable', async (req, res) => {
  try {
    const query = `
            SELECT 
                po.id,
                po.product_id,
                po.orden_numero,
                p.nombre AS product_name,
                po.cantidad_requerida
            FROM 
                produccion.production_orders po
            JOIN 
                maestros.products p ON po.product_id = p.id
            WHERE 
                po.estado = 'Programada'
            ORDER BY 
                po.fecha_inicio_programada ASC, po.created_at ASC;
        `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching selectable production orders:', error);
    res.status(500).json({ message: 'Ocurrió un error interno al obtener las órdenes de producción.' });
  }
});

// === Tasks API ===

// Note: For these endpoints to work, the `produccion.production_tasks` table requires
// two additional columns not specified in the original prompt:
// 1. `task_code VARCHAR(255) UNIQUE NOT NULL` - To store the user-facing ID like 'MO20241021-001'.
// 2. `product_operation_id INTEGER NOT NULL REFERENCES maestros.product_operations(id)` - To link the task to a specific operation.
// Please ensure these columns are added to your database schema.

// GET all tasks for display
app.get('/api/tasks', async (req, res) => {
  try {
    const query = `
            SELECT
                pt.id AS db_id,
                pt.task_code AS id,
                CASE 
                    WHEN pt.estado = 'PENDIENTE' THEN 'Pending'
                    WHEN pt.estado = 'EN_PROGRESO' THEN 'In Progress'
                    WHEN pt.estado = 'PAUSADA' THEN 'Unproductive Cause in Progress'
                    WHEN pt.estado = 'FINALIZADA' THEN 'Completed'
                    ELSE 'Completed'
                END AS status,
                COALESCE(p.nombre, 'Producto Desconocido') AS "partRef",
                COALESCE(pop.nombre_operacion, 'Operación Desconocida') AS op,
                COALESCE(wc.nombre, 'Equipo Desconocido') AS equipment,
                COALESCE(po.cantidad_requerida, 0) AS qty,
                COALESCE(u.nombre_completo, 'Operador Desconocido') AS operator,
                COALESCE(po.orden_numero, 'Orden Desconocida') AS "productionOrderNumber",
                pt.tiempo_minutos
            FROM produccion.production_tasks pt
            LEFT JOIN produccion.production_orders po ON pt.order_id = po.id
            LEFT JOIN maestros.products p ON po.product_id = p.id
            LEFT JOIN produccion.users u ON pt.user_id = u.id
            LEFT JOIN maestros.work_centers wc ON pt.work_center_id = wc.id
            LEFT JOIN maestros.product_operations pop ON pt.product_operation_id = pop.id
            ORDER BY pt.created_at DESC;
        `;
    const { rows } = await pool.query(query);

    // Map DB result to frontend TaskData interface
    const tasks = rows.map(task => ({
      ...task,
      // These fields are managed by frontend state, initialize them here
      totalElapsedTime: (task.tiempo_minutos || 0) * 60,
      startTime: null,
      unproductiveEvents: [], // This would require another table/query
      imageUrl: 'https://images.unsplash.com/photo-1581092921462-69209a5371587?q=80&w=2070&auto=format&fit=crop'
    }));

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Ocurrió un error interno al obtener las tareas.' });
  }
});

// POST a new task
app.post('/api/tasks', async (req, res) => {
  const {
    task_code,
    order_id,
    user_id,
    work_center_id,
    product_operation_id,
    created_by_id
  } = req.body;

  if (!task_code || !order_id || !user_id || !work_center_id || !product_operation_id) {
    return res.status(400).json({ message: 'Se requieren todos los IDs y el código de tarea para su creación.' });
  }

  if (!created_by_id) {
    return res.status(400).json({ message: 'No se ha proporcionado el ID del usuario creador.' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query("SELECT pg_catalog.set_config('session.user_id', $1, true)", [created_by_id]);

    const insertQuery = `
            INSERT INTO produccion.production_tasks
            (task_code, order_id, user_id, work_center_id, product_operation_id, estado, cantidad_producida, tiempo_minutos, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, 'PENDIENTE', 0, 0, NOW(), NOW())
            RETURNING id, task_code;
        `;
    const { rows } = await client.query(insertQuery, [task_code, order_id, user_id, work_center_id, product_operation_id]);

    await client.query('COMMIT');
    res.status(201).json(rows[0]);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating task:', error);
    if (error.code === '23505') { // unique_violation for task_code
      return res.status(409).json({ message: 'El código de tarea generado ya existe. Por favor, intente de nuevo.' });
    }
    res.status(500).json({ message: 'Ocurrió un error interno al crear la tarea.' });
  } finally {
    client.release();
  }
});

// New endpoint to update task status
app.put('/api/tasks/:id/status', async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  if (!id || isNaN(parseInt(id, 10))) {
    return res.status(400).json({ message: 'Se requiere un ID de tarea válido.' });
  }

  const validStates = ['EN_PROGRESO', 'PAUSADA', 'FINALIZADA'];
  if (!estado || !validStates.includes(estado)) {
    return res.status(400).json({ message: `Estado no válido. Los estados permitidos son: ${validStates.join(', ')}.` });
  }

  try {
    const updateQuery = `
            UPDATE produccion.production_tasks
            SET estado = $1, updated_at = NOW()
            WHERE id = $2
            RETURNING id, estado;
        `;
    const { rows } = await pool.query(updateQuery, [estado, id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Tarea no encontrada.' });
    }

    res.status(200).json(rows[0]);

  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ message: 'Ocurrió un error interno al actualizar el estado de la tarea.' });
  }
});


// Server Listening
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
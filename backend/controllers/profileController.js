const db = require('../database/db');

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const query = `
      SELECT u.id, u.name, u.email, u.role, u.created_at,
             sp.student_identifier, sp.technical_skills, sp.interests
      FROM users u
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      WHERE u.id = $1
    `;
    const result = await db.query(query, [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found.' });
    }
    res.json({ profile: result.rows[0] });
  } catch (err) {
    console.error('getProfile error:', err);
    res.status(500).json({ error: 'Failed to retrieve profile.' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { student_identifier, technical_skills, interests, name } = req.body;

    if (name) {
      await db.query('UPDATE users SET name = $1 WHERE id = $2', [name.trim(), userId]);
    }

    // Check if profile exists, otherwise insert
    const existing = await db.query('SELECT id FROM student_profiles WHERE user_id = $1', [userId]);
    if (existing.rows.length > 0) {
      const updateRes = await db.query(
        `UPDATE student_profiles
         SET student_identifier = COALESCE($1, student_identifier),
             technical_skills = COALESCE($2, technical_skills),
             interests = COALESCE($3, interests)
         WHERE user_id = $4
         RETURNING *`,
        [student_identifier, technical_skills, interests, userId]
      );
      res.json({ message: 'Profile updated successfully', profile: updateRes.rows[0] });
    } else {
      const insertRes = await db.query(
        `INSERT INTO student_profiles (user_id, student_identifier, technical_skills, interests)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [userId, student_identifier || '', technical_skills || '', interests || '']
      );
      res.json({ message: 'Profile created successfully', profile: insertRes.rows[0] });
    }
  } catch (err) {
    console.error('updateProfile error:', err);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
};

exports.getAllStudents = async (req, res) => {
  try {
    const query = `
      SELECT u.id, u.name, u.email,
             sp.student_identifier, sp.technical_skills, sp.interests
      FROM users u
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      WHERE u.role = 'student'
      ORDER BY u.name ASC
    `;
    const result = await db.query(query);
    res.json({ students: result.rows });
  } catch (err) {
    console.error('getAllStudents error:', err);
    res.status(500).json({ error: 'Failed to load students.' });
  }
};

exports.deleteProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // We typically don't delete the user account via profile delete, 
    // but we can clear the student_profile data.
    await db.query('DELETE FROM student_profiles WHERE user_id = $1', [userId]);
    
    res.json({ message: 'Student profile data cleared successfully' });
  } catch (err) {
    console.error('deleteProfile error:', err);
    res.status(500).json({ error: 'Failed to delete profile data.' });
  }
};


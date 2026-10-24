const db = require('../database/db');
const path = require('path');
const fs = require('fs');

// Project Documents
exports.uploadDocument = async (req, res) => {
  try {
    const { project_id } = req.body;
    const userId = req.user.id;

    if (!project_id) {
      return res.status(400).json({ error: 'Project ID is required.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Please choose a file to upload.' });
    }

    // Check project membership (or faculty monitor)
    if (req.user.role === 'student') {
      const memberCheck = await db.query(
        `SELECT id FROM project_members WHERE project_id = $1 AND student_id = $2`,
        [project_id, userId]
      );
      if (memberCheck.rows.length === 0) {
        // Remove uploaded file if not permitted
        fs.unlinkSync(req.file.path);
        return res.status(403).json({ error: 'You must be a member of the project to upload documents.' });
      }
    }

    const fileReference = `uploads/${req.file.filename}`;

    const insertRes = await db.query(
      `INSERT INTO project_documents (project_id, uploaded_by, file_name, file_reference)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [project_id, userId, req.file.originalname, fileReference]
    );

    const doc = insertRes.rows[0];
    doc.uploaded_by_name = req.user.name;

    res.status(201).json({
      message: 'Document uploaded successfully',
      document: doc
    });
  } catch (err) {
    console.error('uploadDocument error:', err);
    res.status(500).json({ error: 'Failed to upload document.' });
  }
};

exports.getProjectDocuments = async (req, res) => {
  try {
    const { projectId } = req.params;

    const query = `
      SELECT pd.*, u.name AS uploaded_by_name, u.email AS uploaded_by_email
      FROM project_documents pd
      JOIN users u ON pd.uploaded_by = u.id
      WHERE pd.project_id = $1
      ORDER BY pd.uploaded_at DESC
    `;

    const result = await db.query(query, [projectId]);
    res.json({ documents: result.rows });
  } catch (err) {
    console.error('getProjectDocuments error:', err);
    res.status(500).json({ error: 'Failed to retrieve project documents.' });
  }
};

exports.downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const docRes = await db.query(`SELECT * FROM project_documents WHERE id = $1`, [id]);
    if (docRes.rows.length === 0) {
      return res.status(404).json({ error: 'Document record not found.' });
    }

    const doc = docRes.rows[0];
    const filePath = path.join(__dirname, '..', doc.file_reference);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Physical file not found on server.' });
    }

    res.download(filePath, doc.file_name);
  } catch (err) {
    console.error('downloadDocument error:', err);
    res.status(500).json({ error: 'Failed to download document.' });
  }
};

// Project Links
exports.addLink = async (req, res) => {
  try {
    const { project_id, title, url } = req.body;
    const userId = req.user.id;

    if (!project_id || !title || !url) {
      return res.status(400).json({ error: 'Project ID, title, and valid URL are required.' });
    }

    // Validate URL format
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }

    if (!urlPattern.test(formattedUrl)) {
      return res.status(400).json({ error: 'Please enter a valid URL (e.g., https://example.com).' });
    }

    // Verify user is a member or faculty
    if (req.user.role === 'student') {
      const memberCheck = await db.query(
        `SELECT id FROM project_members WHERE project_id = $1 AND student_id = $2`,
        [project_id, userId]
      );
      if (memberCheck.rows.length === 0) {
        return res.status(403).json({ error: 'You must be a member of the project to add links.' });
      }
    }

    const insertRes = await db.query(
      `INSERT INTO project_links (project_id, added_by, title, url)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [project_id, userId, title.trim(), formattedUrl]
    );

    const link = insertRes.rows[0];
    link.added_by_name = req.user.name;

    res.status(201).json({
      message: 'Link added successfully',
      link
    });
  } catch (err) {
    console.error('addLink error:', err);
    res.status(500).json({ error: 'Failed to add project link.' });
  }
};

exports.getProjectLinks = async (req, res) => {
  try {
    const { projectId } = req.params;

    const query = `
      SELECT pl.*, u.name AS added_by_name
      FROM project_links pl
      JOIN users u ON pl.added_by = u.id
      WHERE pl.project_id = $1
      ORDER BY pl.created_at DESC
    `;

    const result = await db.query(query, [projectId]);
    res.json({ links: result.rows });
  } catch (err) {
    console.error('getProjectLinks error:', err);
    res.status(500).json({ error: 'Failed to retrieve project links.' });
  }
};

exports.deleteLink = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(`DELETE FROM project_links WHERE id = $1`, [id]);
    res.json({ message: 'Link deleted successfully' });
  } catch (err) {
    console.error('deleteLink error:', err);
    res.status(500).json({ error: 'Failed to delete link.' });
  }
};

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const port = 3000;
const db = new sqlite3.Database('./schedule.db');

app.use(bodyParser.json());
app.use(express.static('public')); // This line serves all static files in the 'public' directory

// Initialize DB
db.serialize(() => {
  // Create the 'staff' table if it doesn't exist
  db.run(`CREATE TABLE IF NOT EXISTS staff (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT
  );`);

  // Create the 'shifts' table if it doesn't exist
  db.run(`CREATE TABLE IF NOT EXISTS shifts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    shift_name TEXT,
    shift_date DATE
  );`);

  // Create the 'staff_shifts' table if it doesn't exist
  db.run(`CREATE TABLE IF NOT EXISTS staff_shifts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    staff_id INTEGER,
    shift_id INTEGER,
    FOREIGN KEY (staff_id) REFERENCES staff(id),
    FOREIGN KEY (shift_id) REFERENCES shifts(id)
  );`);
});

app.post('/shifts', (req, res) => {
  const { shift_name, shift_date } = req.body;
  db.run('INSERT INTO shifts (shift_name, shift_date) VALUES (?, ?)', [shift_name, shift_date], function(err) {
    if (err) {
      res.status(500).send({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, shift_name, shift_date });
  });
});

app.post('/assign-staff', (req, res) => {
  const { staff_id, shift_id } = req.body;
  db.run('INSERT INTO staff_shifts (staff_id, shift_id) VALUES (?, ?)', [staff_id, shift_id], function(err) {
    if (err) {
      res.status(500).send({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, staff_id, shift_id });
  });
});


// API to fetch staff names
app.get('/staff', (req, res) => {
  db.all('SELECT * FROM staff', [], (err, rows) => {
    if (err) {
      res.status(500).send({error: err.message});
      return;
    }
    res.send(rows);
  });
});
// Fetch all names
app.get('/names', (req, res) => {
  db.all('SELECT * FROM staff', (err, rows) => {
    if (err) {
      res.status(500).send({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Add a new name
app.post('/names', (req, res) => {
  const { name } = req.body;
  if (name) {
    db.run('INSERT INTO staff (name) VALUES (?)', [name], function(err) {
      if (err) {
        res.status(500).send({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, name });
    });
  } else {
    res.status(400).send({ error: 'Name is required' });
  }
});

// Update a name
app.put('/names/:id', (req, res) => {
  const { name } = req.body;
  const { id } = req.params;
  if (name) {
    db.run('UPDATE staff SET name = ? WHERE id = ?', [name, id], function(err) {
      if (err) {
        res.status(500).send({ error: err.message });
        return;
      }
      res.json({ id: id, name });
    });
  } else {
    res.status(400).send({ error: 'Name is required' });
  }
});

// Delete a name
app.delete('/names/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM staff WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).send({ error: err.message });
      return;
    }
    res.json({ deleted: id });
  });
});

app.post('/assign-staff-to-shift', (req, res) => {
    const { date, shiftType, staffIds } = req.body;
    // Assuming you have a function to process these or direct SQL queries
    assignStaffToShift(date, shiftType, staffIds, (error, result) => {
        if (error) {
            res.status(500).send({ error: 'Failed to assign staff to shift' });
        } else {
            res.send({ message: 'Staff successfully assigned', data: result });
        }
    });
});


function assignStaffToShift(date, shiftType, staffIds, callback) {
    console.log(date + " | " + shiftType + " | " + staffIds);

    staffIds.forEach((id, index) => {
        const sqlQuery = `INSERT INTO staff_shifts (shift_id, staff_id, shift_date) VALUES (?, ?, ?)`;
        db.run(sqlQuery, [shiftType, id, date], function(err) {
            if (err) {
                callback(err);
                return;
            }
            if (index === staffIds.length - 1) {
                callback(null, {message: "Successfully assigned staff to shift."});
            }
        });
    });
}


// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

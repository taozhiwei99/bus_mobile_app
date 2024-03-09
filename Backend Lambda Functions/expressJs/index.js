//import all needed resources
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const serverless = require('serverless-http');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

//establish database connection using environment variables
const db = mysql.createPool({
  connectionLimit: 10,
  host: process.env.HOST,
  user: process.env.DBUSER,
  password: process.env.DBPASS,
  database: process.env.DATABASE
});

//logging/testing database connection
db.getConnection((err, connection) => {
  if (err) {
    console.log("Database connection error", err);
    return;
  }
  console.log("Connected to the database");
  connection.release();
});

//generate QR data
app.get('/api/qr/generator/:userID', (req, res) => {
  try {
    const userID = req.params.userID;
    const sk = process.env.SECRETKEY;
    const qrData = userID + "-" + sk;

    res.send(qrData);
  } catch (error) {
    console.error("Error generating QR data:", error);
    res.status(500).send("Internal Server Error");
  }
});

//api to validate if this child can be updated for driver
app.post('/api/qr/driver/validation', (req, res) => {
  const {QRData, todayDate, driverID} = req.body;
  const childID = QRData.split('-')[0];
  const keyCode = QRData.split('-')[1];
  const skey = process.env.SECRETKEY;

  //validate secret key
  if (keyCode !== skey) {
    res.status(400).json({error: "Invalid QR Code"})
    return;
  };

  db.query(`SELECT status, child_ID FROM vehiclepickup_jobs
    WHERE DATE(jobassigned) = ?
    AND child_ID = ?
    AND driver_ID = ?;`,
    [todayDate, childID, driverID],
    (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      res.status(500).json({error: "Database query error!"});
      return;
    }
    res.json(results);
  });
});

//api to validate if this child can be updated for teacher
app.post('/api/qr/teacher/validation', (req, res) => {
  const {QRData, todayDate, gateID} = req.body;
  const childID = QRData.split('-')[0];
  const keyCode = QRData.split('-')[1];
  const skey = process.env.SECRETKEY;

  //validate secret key
  if (keyCode !== skey) {
    res.status(400).json({error: "Invalid QR Code"})
    return;
  };

  db.query(`SELECT status, child_ID FROM selfpickup_jobs
    WHERE DATE(jobcreated) = ?
    AND child_ID = ?
    AND gate_ID = ?;`,
    [todayDate, childID, gateID],
    (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      res.status(500).json({error: "Database query error!"});
      return;
    }
    res.json(results);
  });
});

//api teacher update booking status to picked up via QR scan
app.put('/api/qr/teacher/updatePickedup', (req, res) => {
  const { newStats, datetime, childID, timestamp, gateID} = req.body;
  db.query(
    `UPDATE selfpickup_jobs SET status = ?,
      jobfinished = ?
      WHERE DATE(jobcreated) = ?
      AND child_ID = ?
      AND gate_ID = ?;`,
    [newStats, timestamp, datetime, childID, gateID],
    (err, results) => {
      if (err) {
        console.error('Database query error:', err);
        res.status(500).json({ error: 'An error occurred' });
        return;
      }
      console.log('Status updated!');
      res.json({ success: true });
    }
  );
});

//api driver update booking status to picked up via QR scan
app.put('/api/qr/driver/updatePickedup', (req, res) => {
  const { datetime, childID, driverID, status} = req.body;
  db.query(
    `UPDATE vehiclepickup_jobs SET status = ? 
      WHERE DATE(jobassigned) = ?
      AND child_ID = ?
      AND driver_ID = ? ;`,
    [status, datetime, childID, driverID],
    (err, results) => {
      if (err) {
        console.error('Database query error:', err);
        res.status(500).json({ error: 'An error occurred' });
        return;
      }
      console.log('Status updated!');
      res.json({ success: true });
    }
  );
});

//api driver update booking status to dropped off via QR scan
app.put('/api/qr/driver/updateDroppedoff', (req, res) => {
  const { datetime, childID, driverID, status, timestamp } = req.body;
  db.query(
    `UPDATE vehiclepickup_jobs
      SET status = ?,
      jobfinished = ?
      WHERE DATE(jobassigned) = ?
      AND child_ID = ?
      AND driver_ID = ?;`,
    [status, timestamp, datetime, childID, driverID],
    (err, results) => {
      if (err) {
        console.error('Database query error:', err);
        res.status(500).json({ error: 'An error occurred' });
        return;
      }
      console.log('Status updated!');
      res.json({ success: true });
    }
  );
});

//api for parent data
app.get('/api/parent/:userID', (req, res) => {
  const userID = req.params.userID;

  // fetch parent data from the database
  db.query('SELECT * FROM parent WHERE parent_ID = ?', [userID], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      res.status(500).json({ error: 'An error occurred' });
      return;
    }
    if (results.length === 0) {
      res.status(404).json({ error: 'Parent not found' });
      return;
    }
    const userData = results[0];
    res.json(userData);
  });
});

//api to update parent password
app.put('/api/parent/updatePass', (req, res) => {
  const {parent_ID, password} = req.body;
  db.query('UPDATE parent SET password = ? WHERE parent_ID = ?', [password, parent_ID], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      res.status(500).json({ error: 'An error occurred' });
      return;
    }
    console.log('Password updated successfully');
    res.json({ success: true });
  });
});

//api to update parent profile
app.put('/api/parent/updateDetails', (req, res) => {
  const { parent_ID, newContact, newAddress } = req.body;
  db.query('UPDATE parent SET contactNo = ?, address = ? WHERE parent_ID = ?', [newContact, newAddress, parent_ID], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      res.status(500).json({ error: 'An error occurred' });
      return;
    }
    console.log('Contact and address updated successfully');
    res.json({ success: true });
  });
});

//api to update parent imageURI
app.put('/api/parent/updateImageURI', (req, res) => {
  const { userID, newImageURI} = req.body;
  db.query(
    'UPDATE parent SET imageURI = ? WHERE parent_ID = ?',
    [newImageURI, userID],
    (err, results) => {
      if (err) {
        console.error('Database query error:', err);
        res.status(500).json({ error: 'An error occurred' });
        return;
      }
      console.log('ImageURI updated successfully');
      res.json({ success: true });
    }
  );
});

//api to update child imageURI
app.put('/api/child/updateImageURI', (req, res) => {
  const { userID, newImageURI} = req.body;
  db.query(
    'UPDATE child SET imageURI = ? WHERE child_ID = ?',
    [newImageURI, userID],
    (err, results) => {
      if (err) {
        console.error('Database query error:', err);
        res.status(500).json({ error: 'An error occurred' });
        return;
      }
      console.log('ImageURI updated successfully');
      res.json({ success: true });
    }
  );
});

//api to change parent sub to prem
app.put('/api/parent/prem/:userID', (req, res) => {
  const userID = req.params.userID;
  db.query("UPDATE parent SET subscription = 'Premium' WHERE parent_ID =?", [userID], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      res.status(500).json({ error: 'An error occurred' });
      return;
    }
    console.log("Subscription updated!");
    res.json({success: true})
  });
});

//api to change parent sub to normal
app.put('/api/parent/normal/:userID', (req, res) => {
  const userID = req.params.userID;
  db.query("UPDATE parent SET subscription = 'Normal' WHERE parent_ID =?", [userID], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      res.status(500).json({ error: 'An error occurred' });
      return;
    }
    console.log("Subscription updated!");
    res.json({success: true})
  });
});

//api for teacher data
app.get('/api/teacher/:userID', (req, res) => {
  const userID = req.params.userID;
  // fetch teacher data from the database
  db.query(`SELECT
      t.*,
      fc.class_Name,
      s.school_Name
      FROM
        teacher t
      JOIN
        form_class fc ON t.class_ID = fc.class_ID
      JOIN
        school s ON t.school_ID = s.school_ID
      WHERE
        t.teacher_ID = ?;`,
      [userID], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      res.status(500).json({ error: 'An error occurred' });
      return;
    }

    if (results.length === 0) {
      res.status(404).json({ error: 'Teacher not found' });
      return;
    }
    const teacherData = results[0];
    res.json(teacherData);
  });
});

//api to get teacher gate Data
app.get('/api/teacherGate', (req, res) => {
  const {datetime, teacherID} = req.query;
  db.query(`SELECT ga.gate_ID, sg.gate_Name
    FROM gate_assignment ga
    JOIN school_gate sg ON ga.gate_ID = sg.gate_ID
    WHERE ga.teacher_ID =  ?
    AND DATE(ga.datetime) = ?;`, 
    [teacherID, datetime], (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      res.status(500).json({error: "An error occurred"});
      return;
    }
    res.json(results[0]);
  });
});

//api to fetch bus drivers for the current school teacher in
app.get('/api/get/teacher/drivers', (req, res) => {
  const {datetime, schoolID} = req.query;
  db.query(
      `SELECT
      DISTINCT vpj.driver_ID, vpj.timeslot, vpj.dropoff_Region, vpj.vehicle_Plate ,
      CONCAT(d.firstName, ' ', d.lastName) AS fullName, d.imageURI
      FROM
      vehiclepickup_jobs vpj
      JOIN
      driver d ON vpj.driver_ID = d.driver_ID
      WHERE
      DATE(vpj.jobassigned) = ?
      AND vpj.school_ID = ?;`,
    [datetime, schoolID],
    (err, results) => {
      if (err) {
        console.error("Database query error:", err);
        res.status(500).json({error: "An error occurred!"});
        return;
      }
      res.json(results);
    }
  )
});

//api to fetch bus drivers for the current school teacher in
app.get('/api/get/teacher/homedrivers', (req, res) => {
  const {datetime, schoolID} = req.query;
  db.query(
      `SELECT
      DISTINCT vpj.driver_ID,
      CONCAT(d.firstName, ' ', d.lastName) AS fullName
      FROM
      vehiclepickup_jobs vpj
      JOIN
      driver d ON vpj.driver_ID = d.driver_ID
      WHERE
      DATE(vpj.jobassigned) = ?
      AND vpj.school_ID = ?;`,
    [datetime, schoolID],
    (err, results) => {
      if (err) {
        console.error("Database query error:", err);
        res.status(500).json({error: "An error occurred!"});
        return;
      }
      res.json(results);
    }
  )
});

//api to fetch driver jobs for teacher
app.get('/api/get/teacher/busJobs', (req, res) => {
  const {datetime, driverID} = req.query;
  db.query(
    `SELECT
    vpj.timeslot,
    vpj.dropoff_Address,
    vpj.status,
    CONCAT(c.firstName, ' ', c.lastName) AS fullName,
    vpj.child_ID
    FROM
    vehiclepickup_jobs vpj
    JOIN
    child c ON vpj.child_ID = c.child_ID
    WHERE
    DATE(vpj.jobassigned) = ? 
    AND vpj.driver_ID = ?;`,
    [datetime, driverID],
    (err, results) => {
      if (err) {
        console.error("Database query error:", err);
        res.status(500).json({error: "An error occurred!"});
        return;
      }
      res.json(results);
    }
  )
});

//api to update teacher password
app.put('/api/teacher/updatePass', (req, res) => {
  const {teacher_ID, password} = req.body;
  db.query('UPDATE teacher SET password = ? WHERE teacher_ID = ?', [password, teacher_ID], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      res.status(500).json({ error: 'An error occurred' });
      return;
    }
    console.log('Password updated successfully');
    res.json({ success: true });
  });
});

//api to update teacher profile
app.put('/api/teacher/updateDetails', (req, res) => {
  const { teacher_ID, newContact, newAddress } = req.body;
  db.query('UPDATE teacher SET contactNo = ?, address = ? WHERE teacher_ID = ?', [newContact, newAddress, teacher_ID], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      res.status(500).json({ error: 'An error occurred' });
      return;
    }
    console.log('Contact and address updated successfully');
    res.json({ success: true });
  });
});

//api to update teacher profile picture
app.put('/api/teacher/updateImageURI', (req, res) => {
  const { userID, newImageURI} = req.body;
  db.query(
    'UPDATE teacher SET imageURI = ? WHERE teacher_ID = ?',
    [newImageURI, userID],
    (err, results) => {
      if (err) {
        console.error('Database query error:', err);
        res.status(500).json({ error: 'An error occurred' });
        return;
      }
      console.log('ImageURI updated successfully');
      res.json({ success: true });
    }
  );
});

//api to get driver data
app.get('/api/driver/:userID', (req, res) => {
  const userID = req.params.userID;
  // fetch driver data from the database based
  db.query(`SELECT
      d.*,
      v.vendor_Name
      FROM
        driver d
      JOIN
        vendor v ON d.vendor_ID = v.vendor_ID
      WHERE
        d.driver_ID = ?;`,
      [userID], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      res.status(500).json({ error: 'An error occurred' });
      return;
    }

    if (results.length === 0) {
      res.status(404).json({ error: 'Driver not found' });
      return;
    }
    const driverData = results[0];
    res.json(driverData);
  });
});

//api to update driver details
app.put('/api/driver/updateDetails', (req, res) => {
  const { driver_ID, newContact, newAddress } = req.body;
  db.query('UPDATE driver SET contactNo = ?, address = ? WHERE driver_ID = ?', [newContact, newAddress, driver_ID], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      res.status(500).json({ error: 'An error occurred' });
      return;
    }
    console.log('Contact and address updated successfully');
    res.json({ success: true });
  });
});

//api to update driver pass
app.put('/api/driver/updatePass', (req, res) => {
  const {driver_ID, password} = req.body;
  db.query('UPDATE driver SET password = ? WHERE driver_ID = ?', [password, driver_ID], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      res.status(500).json({ error: 'An error occurred' });
      return;
    }
    console.log('Password updated successfully');
    res.json({ success: true });
  });
});

//api to update driver profile picture
app.put('/api/driver/updateImageURI', (req, res) => {
  const { userID, newImageURI} = req.body;
  db.query(
    'UPDATE driver SET imageURI = ? WHERE driver_ID = ?',
    [newImageURI, userID],
    (err, results) => {
      if (err) {
        console.error('Database query error:', err);
        res.status(500).json({ error: 'An error occurred' });
        return;
      }
      console.log('ImageURI updated successfully');
      res.json({ success: true });
    }
  );
});

//api to get child data based on ParentID
app.get('/api/child/:parentID', (req, res) => {
  const parentID = req.params.parentID;
  // fetch child data from the database
  db.query(
    'SELECT child_ID, firstName, lastName, imageURI FROM child WHERE parent_ID = ?', [parentID], (err, results) => {
      if (err) {
        console.error('Database query error:', err);
        res.status(500).json({ error: 'An error occurred' });
        return;
      }
      if (results.length === 0) {
        res.status(404).json({ error: 'No children found for the parent' });
        return;
      }
      res.json(results);
    }
  );
});

//api to get child IDs
app.get('/api/childID/:parentID', (req, res) => {
  const parentID = req.params.parentID;
  // fetch child data from the database
  db.query(
    'SELECT child_ID, lastName FROM child WHERE parent_ID = ?', [parentID], (err, results) => {
      if (err) {
        console.error('Database query error:', err);
        res.status(500).json({ error: 'An error occurred' });
        return;
      }
      if (results.length === 0) {
        res.status(404).json({ error: 'No children found for the parent' });
        return;
      }
      res.json(results);
    }
  );
});

//api to get child data for pickup jobs
app.get('/api/pickupchild/:childID', (req, res) => {
  const childID = req.params.childID;
  // fetch child data from the database
  db.query(
    `SELECT child.child_ID, child.firstName, child.lastName, child.address, 
    child.region, child.school_ID, child.parent_ID, child.class_ID, parent.subscription
    FROM child
    JOIN parent ON child.parent_ID = parent.parent_ID
    WHERE child.child_ID = ?`, [childID], (err, results) => {
      if (err) {
        console.error('Database query error:', err);
        res.status(500).json({ error: 'An error occurred' });
        return;
      }
      if (results.length === 0) {
        res.status(404).json({ error: 'No children data found' });
        return;
      }
      res.json(results[0]);
    }
  );
}); 

//api to get child data
app.get('/api/thischild/:childID', (req, res) => {
  const childID = req.params.childID;
  // fetch child data along with related information from other tables
  db.query(
    `SELECT
    c.firstName AS childFirstName,
    c.lastName AS childLastName,
    c.address,
    c.region,
    c.imageURI,
    s.school_Name,
    fc.class_Name,
    t.email,
    t.firstName AS teacherFirstName,
    t.lastName AS teacherLastName
    FROM
        child c
    JOIN
        school s ON c.school_ID = s.school_ID
    JOIN
        form_class fc ON c.class_ID = fc.class_ID
    JOIN
        teacher_child tc ON c.child_ID = tc.child_ID
    JOIN
        teacher t ON tc.teacher_ID = t.teacher_ID
    WHERE
        c.child_ID = ?;`,
    [childID],
    (err, results) => {
      if (err) {
        console.error('Database query error:', err);
        res.status(500).json({ error: 'An error occurred' });
        return;
      }

      if (results.length === 0) {
        res.status(404).json({ error: 'Child not found' });
        return;
      }
      const childData = results[0];
      res.json(childData);
    }
  );
});

//api login for parent
app.post('/api/parent/login', (req, res) => {
  const { username, password } = req.body;
  // authenticate and return firstName
  db.query(`SELECT parent_ID, password, lastName, subscription, school_ID FROM parent WHERE BINARY parent_ID = ? AND BINARY password = ? `, [username, password], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      res.status(500).json({ error: 'An error occurred' });
      return;
    }

    if (results.length > 0) {
      // user authenticated
      const LName = results[0].lastName;
      const schoolID = results[0].school_ID;
      const subTier = results[0].subscription
      res.json({ success: true, LName, schoolID,subTier});
    } else {
      // authentication failed
      res.json({ success: false, error: 'Invalid username or password' });
    }
  });
}); 

//api login for teacher
app.post('/api/teacher/login', (req, res) => {
  const { username, password } = req.body;
  // authenticate and return firstName
  db.query(`SELECT teacher_ID, password, lastName, school_ID FROM teacher WHERE BINARY teacher_ID = ? AND BINARY password = ? `, [username, password], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      res.status(500).json({ error: 'An error occurred' });
      return;
    }

    if (results.length > 0) {
      // user authenticated
      const LName = results[0].lastName;
      const schoolID = results[0].school_ID;
      res.json({ success: true, LName, schoolID});
    } else {
      // authentication failed
      res.json({ success: false, error: 'Invalid username or password' });
    }
  });
}); 

//api login for driver
app.post('/api/driver/login', (req, res) => {
  const { username, password } = req.body;
  // authenticate and return firstName
  db.query(`
    SELECT d.driver_ID, d.password, d.lastName, d.vendor_ID, sv.school_ID
    FROM driver d
    JOIN school_vendor sv ON d.vendor_ID = sv.vendor_ID
    WHERE BINARY d.driver_ID = ? AND BINARY d.password = ?;`, 
  [username, password], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      res.status(500).json({ error: 'An error occurred' });
      return;
    }

    if (results.length > 0) {
      // user authenticated
      const LName = results[0].lastName;
      const vendorID = results[0].vendor_ID;
      const schoolIDs = results.map(result => result.school_ID);
      res.json({ success: true, LName, vendorID, schoolIDs});
    } else {
      // authentication failed
      res.json({ success: false, error: 'Invalid username or password' });
    }
  });
}); 

//parent to get the latest 3 announcements
app.get('/api/parent/announcements/3/:schoolID', (req, res) => {
  const schoolID = req.params.schoolID;
  // query to fetch the latest 3 announcements based on dateTime
  db.query(`
    SELECT a.ann_ID, 
    CONCAT(SUBSTRING_INDEX(a.message, ' ', 15), '...') AS message,
    a.datePosted
    FROM announcement AS a
    JOIN school_admin AS sa ON a.schAdmin_ID = sa.schAdmin_ID
    WHERE sa.school_ID = ?
    ORDER BY a.lastUpdated DESC
    LIMIT 3;`, 
    [schoolID], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      res.status(500).json({ error: 'An error occurred' });
      return;
    }
    res.json(results);
  });
});

//parent to get the latest 10 announcements
app.get('/api/parent/announcements/10/:schoolID', (req, res) => {
  const schoolID = req.params.schoolID;
  // query to fetch the latest 3 announcements based on dateTime
  db.query(`
    SELECT a.*
    FROM announcement AS a
    JOIN school_admin AS sa ON a.schAdmin_ID = sa.schAdmin_ID
    WHERE sa.school_ID = ?
    ORDER BY a.lastUpdated DESC
    LIMIT 10; `, [schoolID], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      res.status(500).json({ error: 'An error occurred' });
      return;
    }
    res.json(results);
  });
});

//teacher to get the latest 3 announcements
app.get('/api/teacher/announcements/3/:schoolID', (req, res) => {
  const schoolID = req.params.schoolID;
  // query to fetch the latest 3 announcements based on dateTime
  db.query(`
    SELECT a.*,
    CONCAT(SUBSTRING_INDEX(a.message, ' ', 15), '...') AS message
    FROM announcement AS a
    JOIN school_admin AS sa ON a.schAdmin_ID = sa.schAdmin_ID
    WHERE sa.school_ID = ?
    ORDER BY a.lastUpdated DESC
    LIMIT 3;`, 
    [schoolID], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      res.status(500).json({ error: 'An error occurred' });
      return;
    }
    res.json(results);
  });
});

//teacher to get the latest 10 announcements
app.get('/api/teacher/announcements/10/:schoolID', (req, res) => {
  const schoolID = req.params.schoolID;
  // query to fetch the latest 3 announcements based on dateTime
  db.query(`
    SELECT a.*
    FROM announcement AS a
    JOIN school_admin AS sa ON a.schAdmin_ID = sa.schAdmin_ID
    WHERE sa.school_ID = ?
    ORDER BY a.lastUpdated DESC
    LIMIT 10; `, [schoolID], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      res.status(500).json({ error: 'An error occurred' });
      return;
    }
    res.json(results);
  });
});

//driver to get the latest 3 announcement
app.get('/api/driver/announcements/3/:vendorID', (req, res) => {
  const vendorID = req.params.vendorID;
  //query to fetch the latest 3 announcements based on dateTime
  db.query(`
    SELECT a.*,
    CONCAT(SUBSTRING_INDEX(a.message, ' ', 15), '...') AS message
    FROM announcement AS a
    JOIN school_admin AS sa ON a.schAdmin_ID = sa.schAdmin_ID
    WHERE sa.school_ID IN (SELECT school_ID FROM school_vendor WHERE vendor_ID = ?)
    ORDER BY a.lastUpdated DESC
    LIMIT 3; `, 
    [vendorID], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      res.status(500).json({ error: 'An error occurred' });
      return;
    }
    res.json(results);
  });
});

//driver to get the latest 10 announcement
app.get('/api/driver/announcements/10/:vendorID', (req, res) => {
  const vendorID = req.params.vendorID;
  //query to fetch the latest 3 announcements based on dateTime
  db.query(`
    SELECT a.*
    FROM announcement AS a
    JOIN school_admin AS sa ON a.schAdmin_ID = sa.schAdmin_ID
    WHERE sa.school_ID IN (SELECT school_ID FROM school_vendor WHERE vendor_ID = ?)
    ORDER BY a.lastUpdated DESC
    LIMIT 10;
  `, [vendorID], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      res.status(500).json({ error: 'An error occurred' });
      return;
    }
    res.json(results);
  });
});

//api to get gate data
app.get('/api/gates/:schoolID', (req, res) => {
  const schoolID = req.params.schoolID;

  db.query(
    'SELECT gate_ID, gate_Name, capacity FROM school_gate WHERE school_ID = ? ',
    [schoolID],
    (err, results) => {
      if (err) {
        console.error("Database query error:", err);
        res.status(500).json({error: "An error occurred"});
        return;
      }
      if (results.length === 0) {
        res.status(404).json({error: "No gates found for this school"});
        return;
      }
      res.json(results);
    }
  );
});

//api to get selfpickup capacity
app.post('/api/spuCapacity', (req, res) => {
  const {timeSlot, school_ID, todayDate} = req.body;

  if (!timeSlot || !school_ID || !todayDate) {
    res.status(400).json({error: "Invalid input data"})
    return;
  }

  db.query(
    `SELECT gate_ID, COUNT(*) AS capacity
    FROM selfpickup_jobs
    WHERE school_ID = ? AND timeSlot = ? AND DATE(jobcreated) = ?
    GROUP BY gate_ID;` ,
    [school_ID, timeSlot, todayDate],
    (err, results) => {
      if (err) {
        console.error("Database query error:", err);
        res.status(500).json({error: "An error occurred"});
        return;
      }
      res.json(results);
    }
  );
});

//api to create self pickup jobs
app.post('/api/selfpickup', (req, res) => {
  const {datetime, timeslot, parent_ID, child_ID, gate_ID, school_ID } = req.body;
  db.query(
    `INSERT INTO selfpickup_jobs (jobcreated, timeslot, parent_ID, child_ID, gate_ID, school_ID)
    VALUES (?, ?, ?, ?, ?, ?)` ,
    [datetime, timeslot, parent_ID, child_ID, gate_ID, school_ID],
    (err, results) => {
      if (err) {
        console.error("Database query error:", err);
        res.status(500).json({error: "An error occurred"});
        return;
      }
      res.json({sucess: true})
    }
  );
});

//api to create bus pickup jobs
app.post('/api/buspickup', (req, res) => {
  const {datetime, timeslot, address, region, parent_ID, child_ID, school_ID} = req.body;
  db.query(
    `INSERT INTO vehiclepickup_jobs (jobcreated, timeslot, dropoff_Address, dropoff_Region
      , parent_ID, child_ID, school_ID) VALUES (?, ?, ?, ?, ?, ?, ?)` ,
    [datetime, timeslot, address, region, parent_ID, child_ID, school_ID],
    (err, results) => {
      if (err) {
        console.error("Database query error:", err);
        res.status(500).json({error: "An error occurred"});
        return;
      }
      res.json({success: true})
    }
  );
});

//api to check if booking exist
app.get('/api/checkBooking', (req, res) => {
  const {child_ID, datetime} = req.query;
  console.log("before database");

  db.query(
    `SELECT spu_Job_ID FROM selfpickup_jobs WHERE child_ID = ? AND DATE(jobcreated) = ?
    UNION
    SELECT vpu_Job_ID FROM vehiclepickup_jobs WHERE child_ID = ? AND DATE(jobcreated) = ?;
    `,
    [child_ID, datetime, child_ID, datetime],
    (err, results) => {
      if (err) {
        console.error("Database query error:", err);
        res.status(500).json({ error: "An error occurred" });
        return;
      }
      if (results.length === 0) {
        res.json({ success: true });
      } else {
        res.json({ success: false });
      }
    }
  );
});

//api to retrieve current parent self pickup jobs
app.get('/api/get/selfpickup', (req, res) => {
  const { parent_ID, datetime } = req.query;
  db.query(
    `
    SELECT selfpickup_jobs.*, school_gate.gate_Name
    FROM selfpickup_jobs
    LEFT JOIN school_gate ON selfpickup_jobs.gate_ID = school_gate.gate_ID
    WHERE selfpickup_jobs.parent_ID = ? AND DATE(selfpickup_jobs.jobcreated) = ?;
    `,
    [parent_ID, datetime],
    (err, results) => {
      if (err) {
        console.error("Database query error:", err);
        res.status(500).json({ error: "An error occurred" });
        return;
      }
      res.json(results);
    }
  );
});

//api for teacher to retrieve their self pickup student details
app.get('/api/get/teacher/selfpikcup', (req, res) => {
  const {datetime, gateID} = req.query;
  db.query(
    `SELECT sj.*, CONCAT(c.firstName, ' ', c.lastName) AS fullName
    FROM selfpickup_jobs sj
    JOIN child c ON sj.child_ID = c.child_ID
    WHERE DATE(sj.jobcreated) = ?
    AND sj.gate_ID = ?;`,
    [datetime, gateID],
    (err, results) => {
      if(err) {
        console.error("Database query error:", err);
        res.status(500).json({error: "An error occurred"});
        return;
      }
      res.json(results);
    }
  );
});

//api teacher update child status
app.put('/api/teacher/updatePickedUp', (req, res) => {
  const { newStats, datetime, childID, timestamp} = req.body;
  db.query(
    `UPDATE selfpickup_jobs SET status = ?,
    jobfinished = ?
     WHERE DATE(jobcreated) = ?
    AND child_ID = ?;`,
    [newStats, timestamp, datetime, childID],
    (err, results) => {
      if (err) {
        console.error('Database query error:', err);
        res.status(500).json({ error: 'An error occurred' });
        return;
      }
      console.log('Status updated!');
      res.json({ success: true });
    }
  );
});

//api to retrieve current parent bus pickup jobs
app.get('/api/get/buspickup', (req, res) => {
  const { parent_ID, datetime } = req.query;
  db.query(
    `
    SELECT *
    FROM vehiclepickup_jobs
    WHERE parent_ID = ? AND DATE(jobcreated) = ?;
    `,
    [parent_ID, datetime],
    (err, results) => {
      if (err) {
        console.error("Database query error:", err);
        res.status(500).json({ error: "An error occurred" });
        return;
      }
      res.json(results);
    }
  );
});

//api to fetch driver job deails
app.get('/api/get/jobDetails', (req, res) => {
  const { driver_ID, datetime } = req.query;
  db.query(
    `
    SELECT v.timeslot, v.dropoff_Region, v.vehicle_Plate, v.school_ID, s.school_Name
    FROM vehiclepickup_jobs AS v
    JOIN school AS s ON v.school_ID = s.school_ID
    WHERE v.driver_ID = ? AND DATE(v.jobassigned) = ? ;
    `,
    [driver_ID, datetime],
    (err, results) => {
      if (err) {
        console.error("Database query error:", err);
        res.status(500).json({ error: "An error occurred" });
        return;
      }
      res.json(results[0]);
    }
  );
});

//api to fetch bus job details for driver
app.get('/api/get/driverJobs', (req, res) => {
  const {driver_ID, datetime} = req.query;
  db.query(
    `SELECT
    v.*,
    CONCAT(c.firstName, ' ', c.lastName) AS fullName,
    c.address AS address,
    s.school_Name
    FROM
        vehiclepickup_jobs AS v
    JOIN
        child AS c ON v.child_ID = c.child_ID
    JOIN
        school AS s ON v.school_ID = s.school_ID
    WHERE
        DATE(v.jobassigned) = ?
        AND v.driver_ID = ? ;`,
    [datetime, driver_ID],
    (err, results) => {
      if (err) {
        console.error("Database query error:", err);
        res.status(500).json({error: "An error occurred!"});
        return;
      }
      res.json(results);
    }
  )
});

//api driver update booking status to picked up
app.put('/api/driver/updatePickedup', (req, res) => {
  const { newStats, datetime, childID} = req.body;
  db.query(
    `UPDATE vehiclepickup_jobs SET status = ? WHERE DATE(jobassigned) = ?
      AND child_ID = ? ;`,
    [newStats, datetime, childID],
    (err, results) => {
      if (err) {
        console.error('Database query error:', err);
        res.status(500).json({ error: 'An error occurred' });
        return;
      }
      console.log('Status updated!');
      res.json({ success: true });
    }
  );
});

//api driver update booking status to dropped off
app.put('/api/driver/updateDroppedoff', (req, res) => {
  const { newStats, timestamp, datetime, childID} = req.body;
  db.query(
    `UPDATE vehiclepickup_jobs
      SET status = ?,
      jobfinished = ?
      WHERE DATE(jobassigned) = ?
      AND child_ID = ?;`,
    [newStats, timestamp, datetime, childID],
    (err, results) => {
      if (err) {
        console.error('Database query error:', err);
        res.status(500).json({ error: 'An error occurred' });
        return;
      }
      console.log('Status updated!');
      res.json({ success: true });
    }
  );
});

module.exports.handler = serverless(app);
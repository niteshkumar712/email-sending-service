// src/index.js

const express = require('express');
const emailRoutes = require('./routes/emailRoutes');

const app = express();
app.use(express.json());

app.use('/api/emails', emailRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

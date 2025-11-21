const app = require('./app');
const ensureTable = require('./utils/db-init');

const port = process.env.PORT || 3000;

ensureTable().then(() => {
  app.listen(port, () => console.log(`Server listening on ${port}`));
}).catch(err => { 
  console.error('Failed to ensure table:', err); 
  process.exit(1); 
});

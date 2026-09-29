const { User } = require('./models');
async function fix() {
  await User.update({ status: 'active' }, { where: { email: 'admin@tms.lk' } });
  console.log('Admin activated');
  process.exit();
}
fix();

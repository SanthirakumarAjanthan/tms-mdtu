const { User } = require('./models');
async function test() {
  const users = await User.findAll({ attributes: ['id', 'email', 'status'] });
  console.log(JSON.stringify(users, null, 2));
  process.exit();
}
test();

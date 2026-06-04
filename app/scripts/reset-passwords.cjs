const { hash } = require('bcryptjs');
const { createConnection } = require('mysql2/promise');

const DB_URL = 'mysql://25HctVw41aqd2Sy.root:T6cTB3Qnexet4jOv7uxhJ9fII282WYLc@ep-t4ni387b5e83b7519dc8.epsrv-t4n281l4mrmemi4zls9a.ap-southeast-1.privatelink.aliyuncs.com:4000/19e19677-8872-8934-8000-096b404d32af';

async function main() {
  console.log('Connecting to DB...');
  const conn = await createConnection(DB_URL);
  console.log('Connected!');
  
  const passwordHash = await hash('Goodeni001213011', 12);
  console.log('Hash generated');
  
  // Update or insert admin user
  const [adminRows] = await conn.execute('SELECT id FROM users WHERE nickname = ?', ['admin']);
  if (adminRows.length > 0) {
    await conn.execute('UPDATE users SET password_hash = ?, role = "admin" WHERE nickname = ?', [passwordHash, 'admin']);
    console.log('Updated admin user');
  } else {
    await conn.execute(
      'INSERT INTO users (nickname, email, phone, password_hash, first_name, last_name, age, messenger_link, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      ['admin', 'admin@starlight.ru', '+79999999999', passwordHash, 'Системный', 'Администратор', 25, '@admin_sl', 'admin']
    );
    console.log('Created admin user');
  }
  
  // Update or insert Goodeni user
  const [goodeniRows] = await conn.execute('SELECT id FROM users WHERE nickname = ?', ['Goodeni']);
  if (goodeniRows.length > 0) {
    await conn.execute('UPDATE users SET password_hash = ?, role = "trainer" WHERE nickname = ?', [passwordHash, 'Goodeni']);
    console.log('Updated Goodeni user');
  } else {
    await conn.execute(
      'INSERT INTO users (nickname, email, phone, password_hash, first_name, last_name, age, messenger_link, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      ['Goodeni', 'goodeni@starlight.ru', '+79111111111', passwordHash, 'Егор', 'Goodeni', 22, '@goodeni', 'trainer']
    );
    console.log('Created Goodeni user');
  }
  
  await conn.end();
  console.log('Done!');
}

main().catch(console.error);

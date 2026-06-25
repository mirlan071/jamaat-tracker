const db = require('./db');
const jsonData = require('./jamaat.json');

async function migrate() {
  console.log('Миграция данных из JSON в PostgreSQL...\n');

  await db.initDB();
  console.log('Таблицы созданы ✓');

  for (const user of jsonData.users) {
    await db.users.create({
      phone: user.phone,
      password: user.password,
      full_name: user.full_name,
      role: user.role,
    });
    console.log(`  Пользователь: ${user.full_name} (${user.phone})`);
  }

  for (const mosque of jsonData.mosques) {
    await db.mosques.create({
      name: mosque.name,
      address: mosque.address,
      region: mosque.region,
      city: mosque.city,
      phone: mosque.phone,
      can_host_jamaat: mosque.can_host_jamaat,
      admin_id: mosque.admin_id || null,
    });
    console.log(`  Мечеть: ${mosque.name}`);
  }

  for (const jamaat of jsonData.jamaats) {
    await db.jamaats.create({
      mosque_id: jamaat.mosque_id,
      leader_name: jamaat.leader_name,
      leader_phone: jamaat.leader_phone,
      member_count: jamaat.member_count,
      duration_type: jamaat.duration_type,
      start_date: jamaat.start_date,
      end_date: jamaat.end_date,
      notes: jamaat.notes,
      status: jamaat.status,
      created_by: jamaat.created_by,
    });
    console.log(`  Джамаат: ${jamaat.leader_name} (${jamaat.duration_type})`);
  }

  for (const member of jsonData.jamaat_members) {
    await db.jamaat_members.create({
      jamaat_id: member.jamaat_id,
      name: member.name,
      phone: member.phone,
    });
    console.log(`  Участник: ${member.name}`);
  }

  console.log('\nМиграция завершена! ✓');
  console.log(`  Пользователей: ${jsonData.users.length}`);
  console.log(`  Мечетей: ${jsonData.mosques.length}`);
  console.log(`  Джамаатов: ${jsonData.jamaats.length}`);
  console.log(`  Участников: ${jsonData.jamaat_members.length}`);

  await db.pool.end();
}

migrate().catch(err => {
  console.error('Ошибка миграции:', err);
  process.exit(1);
});

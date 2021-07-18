import { usersDb } from '../../../../database/json/db';
import { Command, CommandData } from '../../protocols/command';

const func: Command = async ({ client, message, value }) => {
  if (!value) {
    await client.reply(
      message.from,
      'Você precisa marcar o usuário ou me enviar o número.',
      message.id
    );
    return;
  }

  const userId = value?.trim().replace('@', '').replace('+', '') + '@c.us';

  const user = usersDb.getFirst({ id: userId });

  if (!user) {
    await client.reply(message.from, 'Usuário não encontrado.', message.id);
    return;
  }

  if (user.role === 'admin') {
    await client.reply(
      message.from,
      'O usuário informado é um administrador.',
      message.id
    );
    return;
  }

  if (user.role === 'moderator') {
    await client.reply(
      message.from,
      'O usuário informado já é um moderador.',
      message.id
    );
    return;
  }

  usersDb.update(user, { role: 'moderator' });

  await client.reply(
    message.from,
    'Usuário promovido a moderador.',
    message.id
  );
};

const promote: CommandData = {
  func,
  description: '',
  category: 'botAdministration',
  command: '.promote',
  allowedUsers: 'admin',
  hidden: true,
};

export default promote;

import { Command, CommandData, CommandType } from '@command-protocols';
import { getContactName } from 'src/bot/helpers/get-contact-name';
import { getGroupByIdOrName } from 'src/bot/helpers/get-group-by-id-or-name';
import { outputErrorMessage } from 'src/bot/utils/output-error-message';

const func: Command = async ({ client, message, value }) => {
  let msg = '';

  if (!value) {
    outputErrorMessage(client, message, 'Você precisa fornecer um id.');
    return;
  }

  const targetGroup = await getGroupByIdOrName(client, value);

  if (!targetGroup) {
    outputErrorMessage(client, message, 'Nenhum grupo encontrado.');
    return;
  }

  const { participants } = targetGroup.groupMetadata;
  msg += `${targetGroup.name} - ${targetGroup.id}\n\n\nParticipantes:\n\n`;
  for (const participant of participants) {
    const contact = await client.getContact(participant.id._serialized);
    if (!contact || contact.isMe) {
      continue;
    }

    const name = getContactName(contact);
    msg += `*${name}* - ${participant.id.user}\n\n`;
  }

  client.reply(message.from, msg, message.id);
};

const viewGroup: CommandData = {
  func,
  description: 'Mostra o chat do grupo informado',
  category: CommandType.BOT_ADMINISTRATION,
  command: ['.viewgroup', '.vg'],
  allowedUsers: 'admin',
  allowInGroups: true,
  allowInPrivate: true,
};

export default viewGroup;

import { getNumberFromContactId } from '../../../helpers/get-number-from-contact-id';
import { Command, CommandData } from '../protocols/command';
import { getRamdom } from '../../../helpers/get-random';
const func: Command = async ({ client, message, value }) => {
  if (value?.charAt(0) !== '@') {
    await client.reply(
      message.from,
      'Você precisa me dizer qual pessoa você quer beijar',
      message.id
    );
    return;
  }

  const kissedPerson = value.trim();
  const personExists = message.chat.groupMetadata.participants.some(
    async (participant) => (participant.id as any).includes(kissedPerson)
  );

  if (!personExists) {
    await client.reply(
      message.from,
      'Você precisa me dizer qual pessoa você quer beijar',
      message.id
    );
    return;
  }

  const giphys = [
    'https://media.giphy.com/media/f5vXCvhSJsZxu/giphy.gif',
    'https://media.giphy.com/media/108M7gCS1JSoO4/giphy.gif',
    'https://media.giphy.com/media/108M7gCS1JSoO4/giphy.gif',
    'https://media.giphy.com/media/CGXNYwxCB0x2M/giphy.gif',
    'https://media.giphy.com/media/1n8xEcgopDKzDcQgL1/giphy.gif',
    'https://media.giphy.com/media/nlYANXaU495cc/giphy.gif',
  ];

  await client.sendGiphyAsSticker(message.from, getRamdom(giphys));

  const msg = `Minha nossa!!\n @${getNumberFromContactId(
    message.sender.id
  )} deu um beijo em ${kissedPerson}`;

  await client.sendTextWithMentions(message.from, msg);
};

const kiss: CommandData = {
  command: '.kiss',
  category: 'funny',
  description: 'Mande um beijo para alguém do grupo',
  func,
  onlyForGroups: true,
  // hidden: true,
};

export default kiss;

import { Command, CommandData, CommandType } from '@command-protocols';
import { getRandom } from '@utils';

const func: Command = async (params) => {
  const { client, message } = params;
  const answers = ['Sim.', 'Não.', 'Talvez.'];
  const answer = getRandom(answers);
  await client.reply(message.from, `${answer}`, message.id);
};

const yesOrNo: CommandData = {
  command: ['.p'],
  category: CommandType.FUNNY,
  description: 'Responde sim, não ou talvez',
  func,
  allowInGroups: true,
  allowInPrivate: true,
};

export default yesOrNo;

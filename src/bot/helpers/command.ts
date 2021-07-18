import { Client, Message } from '@open-wa/wa-automate';
import { getCommandList } from '../commands/command-list';
import { CommandData } from '../commands/protocols/command';

export let commandList: CommandData[] = []

export const parseCommand = (query: string) => {
  const command = query.split(' ')[0].trim();
  const value = query.replace(command, '').trim();
  return {
    command: command.toLowerCase(),
    value: value.replace(/"/gi, ''),
  };
};

function getCommand(
  command: string,
  commandList: CommandData[]
): CommandData | null {
  let commandToBeExecuted = null;

  commandList.forEach((com) => {
    if (com.command === command) {
      commandToBeExecuted = com;
    }
  });

  return commandToBeExecuted;
}

interface CommandHandlerParams {
  commandData: CommandData;
  query: string;
  message: Message;
  client: Client;
}

export const getCommandData = async (
  query: string
): Promise<CommandData | null> => {
  if (!commandList.length) {
    commandList = await getCommandList();
  }

  const { command } = parseCommand(query);

  const commandData = getCommand(command, commandList);

  return commandData;
};

export async function handleCommand({
  commandData,
  query,
  client,
  message,
}: CommandHandlerParams): Promise<boolean> {
  if (!commandData) {
    return false;
  }

  const { command, value } = parseCommand(query);

  if (commandData.onlyForGroups && !message.chat.isGroup) {
    await client.sendText(message.from, 'Este comando é apenas para grupos');
    return false;
  }

  let success = false;

  await commandData
    .func({
      client,
      message,
      value,
    })
    .then(() => {
      success = true;
    })
    .catch(async (error) => {
      console.log(error);
      await client.reply(
        message.from,
        'Erro ao executar o comando :(',
        message.id
      );
    });

  return success;
}

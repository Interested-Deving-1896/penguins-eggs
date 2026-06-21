import { select } from '@inquirer/prompts'

export default async function selectInterface(iface = 'eth0', ifaces: string[]): Promise<string> {
  const choices = ifaces.map((i) => ({ name: i, value: i }));

  const answer = await select({
    choices,
    default: iface,
    message: 'Select interface: ',
  });

  return answer;
}

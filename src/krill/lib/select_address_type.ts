import { select } from '@inquirer/prompts'

export default async function selectAddressType(): Promise<string> {
  const answer = await select({
    choices: [
      { name: 'dhcp', value: 'dhcp' },
      { name: 'static', value: 'static' },
    ],
    default: 'dhcp',
    message: 'Select address type: ',
  });
  return answer;
}

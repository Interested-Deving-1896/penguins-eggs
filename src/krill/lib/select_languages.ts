import { select } from '@inquirer/prompts'

import Locales from '../../classes/locales.js'

export default async function selectLanguages(selectedLanguage = ''): Promise<string> {
  const locales = new Locales()
  const supported = await locales.getSupported()
  const selected = selectedLanguage

  const choices = supported.map((l: any) => ({ name: l, value: l }));

  const answer = await select({
    choices,
    default: selected,
    message: 'Select language: ',
  });

  return answer;
}

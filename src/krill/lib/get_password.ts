/**
 * ./src/lib/get_password.ts
 * penguins-eggs-legacy v.25.7.x / ecmascript 2020
 * author: Piero Proietti
 * email: piero.proietti@gmail.com
 * license: MIT
 */

import inquirer from 'inquirer'

export default async function getPassword(user = 'root', initial: string): Promise<string> {
  return new Promise((resolve) => {
    const questions: any = [
      {
        default: initial,
        message: `Choose a password for ${user}: `,
        name: 'password',
        type: 'password'
      },
      {
        default: initial,
        message: `Confirm your ${user} password: `,
        name: 'confirmPassword',
        type: 'password'
      }
    ]

    inquirer.prompt(questions).then((options: any) => {
      resolve(options.password)
    })
  })
}

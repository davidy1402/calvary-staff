#!/usr/bin/env node

import { pbkdf2Sync, randomBytes } from 'node:crypto';
import { stdin, stdout } from 'node:process';

const ITERATIONS = 310_000;
const MIN_LENGTH = 4;
const MAX_LENGTH = 12;

const readPin = async () => {
  if (!stdin.isTTY || !stdout.isTTY) {
    throw new Error('请在终端直接运行此工具，不要通过管道传入 PIN。');
  }

  stdout.write(`输入新的管理员 PIN（${MIN_LENGTH}-${MAX_LENGTH} 位数字）：`);
  stdin.setRawMode(true);
  stdin.resume();
  stdin.setEncoding('utf8');

  let pin = '';
  for await (const chunk of stdin) {
    for (const character of chunk) {
      if (character === '\u0003') {
        stdin.setRawMode(false);
        stdout.write('\n已取消。\n');
        process.exit(130);
      }
      if (character === '\r' || character === '\n') {
        stdin.setRawMode(false);
        stdin.pause();
        stdout.write('\n');
        return pin;
      }
      if (/\d/.test(character) && pin.length < MAX_LENGTH) {
        pin += character;
        stdout.write('*');
      }
    }
  }

  return pin;
};

const pin = await readPin();
if (!/^\d{4,12}$/.test(pin)) {
  throw new Error(`PIN 必须是 ${MIN_LENGTH}-${MAX_LENGTH} 位数字。`);
}

const salt = randomBytes(16);
const hash = pbkdf2Sync(pin, salt, ITERATIONS, 32, 'sha256');

console.log('\n请把以下两行分别填入 Supabase → Edge Functions → Secrets：');
console.log(`ADMIN_PIN_SALT=${salt.toString('base64')}`);
console.log(`ADMIN_PIN_HASH=${hash.toString('base64')}`);
console.log('\nPIN 不会写入文件；完成更新后，可删除本次终端输出。');

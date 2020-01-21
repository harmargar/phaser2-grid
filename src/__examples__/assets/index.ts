// @ts-ignore
import * as IMG from './img/*.png';

type StringKeyValuePair<T extends string> = { [key in T]: string } & { default: { [key in T]: string } };

type IMGKeyStore = 'chick' | 'duck' | 'owl' | 'parrot';

type IMGKeyValuePair = StringKeyValuePair<IMGKeyStore>;

export const IMGKeyValues = IMG as IMGKeyValuePair;
export const IMGKeys = getKeys<IMGKeyValuePair>(IMG);

function getKeys<T extends StringKeyValuePair<string>>(files: T): T {
  const keys: T = {} as T;
  for (const key in files) {
    if (files.hasOwnProperty(key)) {
      // @ts-ignore
      keys[key as string] = key;
    }
  }
  return keys;
}

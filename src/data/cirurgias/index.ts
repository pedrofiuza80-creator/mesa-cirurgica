import type { Cirurgia } from '../../types';
import { suturaDeFerida } from './sutura-de-ferida';
import { exereseLipomaCisto } from './exerese-lipoma-cisto';
import { traqueostomia } from './traqueostomia';
import { apendicectomiaAberta } from './apendicectomia-aberta';
import { herniorrafiaInguinal } from './herniorrafia-inguinal';
import { laparotomiaExploradora } from './laparotomia-exploradora';
import { colecistectomiaAberta } from './colecistectomia-aberta';

/** Para adicionar uma cirurgia: crie um arquivo nesta pasta e inclua-o na lista abaixo. */
export const CIRURGIAS: Cirurgia[] = [
  suturaDeFerida, exereseLipomaCisto, traqueostomia, apendicectomiaAberta,
  herniorrafiaInguinal, laparotomiaExploradora, colecistectomiaAberta,
];

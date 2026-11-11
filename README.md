# Mesa Cirúrgica 3D

Jogo de estudo de instrumentação cirúrgica (Técnica Operatória), feito com Vite + TypeScript + Three.js.

## Como rodar

```bash
npm install
```

```bash
npm run dev
```

Depois abra o endereço que aparecer no terminal (normalmente http://localhost:5173).

## Onde fica cada coisa

- `src/data/instrumentos.ts`: fichas dos instrumentos (nome, categoria, uso, como reconhecer). É aqui que se corrige conteúdo.
- `src/data/cirurgias/`: uma cirurgia por arquivo (tempos, essenciais, opcionais e quantidades).
- `src/pontuacao.ts`: como a mesa montada vira nota no modo Simular cirurgia.
- `src/data/categorias.ts`: os tempos cirúrgicos e suas cores.
- `src/models/`: desenho 3D dos instrumentos com formas básicas.
- `src/ambiente.ts`: a sala cirúrgica (paredes, piso, lâmpada, equipamentos, paciente coberto).
- `src/models/pessoas.ts`: a equipe cirúrgica estilizada (feita no código; botão "Equipe" liga/desliga).
- `src/models/carregador.ts`: carrega modelos `.glb` opcionais; ver `docs/modelos-3d.md`.
- `public/models/catalogo.json`: lista dos modelos `.glb` em uso (com autor e licença).
- `src/main.ts`: a cena 3D e os modos de jogo.
- `prototipo/mesa-cirurgica.html`: o protótipo original, guardado como referência.

Material de estudo: a classificação e a disposição da mesa variam entre faculdades e serviços.

# Como colocar modelos 3D (.glb) no jogo

Por padrão todos os instrumentos usam modelos simples, feitos no código. Para trocar um por um modelo melhor, ou
para colocar pessoas (médicos) na sala, siga os passos abaixo. Se o arquivo faltar ou falhar, o jogo continua
funcionando com o modelo simples.

## Passo a passo

1. Baixe o modelo em formato **.glb** (se vier em outro formato, converta; o Blender abre quase tudo e exporta .glb).
2. Instrumento: coloque o arquivo em `public/models/instrumentos/`. Pessoa: em `public/models/pessoas/`.
3. Registre o arquivo em `public/models/catalogo.json`:

```json
{
  "instrumentos": {
    "kelly": { "arquivo": "kelly.glb", "autor": "Nome do artista", "licenca": "CC0", "fonte": "https://endereço-da-página" }
  },
  "pessoas": [
    { "arquivo": "cirurgiao.glb", "nome": "Cirurgião", "x": -9, "z": -6, "giro": 0.5,
      "autor": "Nome do artista", "licenca": "CC-BY 4.0", "fonte": "https://endereço-da-página" }
  ]
}
```

- A chave do instrumento (`"kelly"`) é o `id` dele em `src/data/instrumentos.ts`.
- O jogo ajusta sozinho o tamanho e a posição do instrumento (deita, centraliza e iguala o comprimento ao do modelo simples).
- Pessoas: `x` e `z` são a posição no chão (a mesa fica em 0,0; o fundo da sala em z = -18; a porta está à esquerda).
  `giro` é o ângulo em radianos. `escala` (opcional) ajusta o tamanho; `animacao` escolhe uma animação pelo nome.

## Licença: confira ANTES de usar

Cada modelo tem uma licença na página de onde foi baixado. Regras práticas:

- **CC0 / domínio público**: pode usar sem restrição.
- **CC-BY**: pode usar, mas precisa dar o crédito. Preencha `autor`, `licenca` e `fonte`; a página "Revisar conteúdo" lista os créditos.
- **CC-BY-NC** ou "uso não comercial": serve para uso pessoal/estudo, mas não para vender. Anote a licença.
- **Sem licença visível, "só para visualização", "editorial" ou modelo extraído de jogo/filme**: não use.

Sempre guarde o endereço da página (`fonte`). A página "Revisar conteúdo" destaca modelos sem autor ou licença.

## Dicas de qualidade

- Prefira modelos leves (até alguns MB). Muitos modelos pesados deixam o jogo lento em computadores fracos.
- Instrumentos: o modelo precisa estar em escala proporcional; o jogo reescala pelo comprimento.

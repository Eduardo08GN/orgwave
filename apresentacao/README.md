# Apresentação — Live de Lançamento

Deck de scroll da live de lançamento da Organic Wave. HTML, CSS e JS puro, sem build step. Página única.

Segue o design system da landing (mesmos tokens, fontes Clash Display + Plus Jakarta Sans + Space Mono, accent aqua com dourado no dinheiro). Tema escuro com seções claras alternadas.

## Estrutura

```
index.html   deck completo (estilos e script inline)
img/         logo da marca, prints de resultado, fotos de fundo
```

## Rodar local

Caminhos são relativos, sem `<base href>`, então funciona tanto aberto direto quanto servido por HTTP:

```bash
python -m http.server 8000
```

## Notas

- Os arquivos `img/print_mes.jpg` e `img/print_15d.jpg` são capturas de resultado usadas como prova, as mesmas métricas já exibidas na landing pública.
- Data da live embutida no HTML (`22 de julho, 20h`). Ajustar em caso de nova data.

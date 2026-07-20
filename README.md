# Organic Wave

Landing page da mentoria Organic Wave. Site estático — HTML, CSS e JS puro, sem build step.

Espelho de `automaweb/public/organicwave/` (repo `projetosweb`), no ar em https://automaweb.pro/organicwave

## Estrutura

```
index.html        página completa (single page)
css/style.css     estilos
js/main.js        interações
assets/           imagens, vídeos de fundo e posters
```

## Rodar local

Precisa ser servido por HTTP (não abrir o arquivo direto), por causa da tag `<base>` e dos vídeos:

```bash
python -m http.server 8000
```

## Deploy — atenção ao `<base href>`

O `index.html` traz na linha 6:

```html
<base href="/organicwave/" />
```

Todos os caminhos relativos (`assets/…`, `css/style.css`) resolvem contra esse prefixo. Ajuste conforme onde o site for publicado:

| Destino | `<base href>` |
|---|---|
| automaweb.pro/organicwave (atual) | `/organicwave/` |
| domínio próprio, na raiz | `/` |
| GitHub Pages (`/orgwave/`) | `/orgwave/` |

As metatags `og:image` e `og:url` também apontam para `automaweb.pro/organicwave` e precisam do mesmo ajuste em domínio novo.

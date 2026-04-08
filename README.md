# Rapiclip

Rapiclip tiene dos partes:

- `extension/`: la extension para YouTube. Permite marcar inicio y fin, generar un link y copiarlo.
- `web/`: la web publica que abre ese link y reproduce el clip con los tiempos guardados.

## Uso rapido

1. Instala la extension desde `extension/`.
2. Abre un video de YouTube.
3. Marca inicio y fin.
4. Genera el link y abre la web de Rapiclip.

## Desarrollo

- Web: `cd web` y `npm run dev`
- Extension: los archivos principales estan en `extension/content.js` y `extension/content.css`

## Privacidad

Ver [`PRIVACY_POLICY.md`](./PRIVACY_POLICY.md).

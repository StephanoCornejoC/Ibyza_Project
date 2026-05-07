# seed_assets/

Imagenes que necesitan los management commands de seed para poblar la base de
datos en el primer deploy. Viven dentro del repositorio porque el filesystem
de Render es efimero y se pierde en cada redeploy: si las dejaramos en `media/`
desaparecerian apenas se reinicia el contenedor.

## Para que sirve

`seed_proyectos` lee de aca la imagen de fachada de cada proyecto y la asigna
al `ImageField` correspondiente la PRIMERA vez que el proyecto se crea en la
base. Despues queda copiada en el storage de la app (`media/proyectos/`) y se
sirve normalmente.

## Estructura esperada

```
seed_assets/
├── README.md
└── proyectos/
    ├── <slug-del-proyecto>/
    │   └── fachada.<ext>      <- una sola, png o jpg
    ...
```

El slug debe coincidir EXACTAMENTE con el `slug` del proyecto en
`seed_proyectos.py`. La extension puede ser `.png`, `.jpg`, `.jpeg`, etc.;
el seed toma la primera coincidencia de `fachada.*`.

## Que NO hacer

- NO modificar estos archivos despues del primer deploy. Diana edita las
  fachadas desde el admin de Django; si pisas la imagen aca y reactivas
  `--clear`, perdes el cambio que ella hizo.
- NO agregar galerias completas. La galeria por proyecto puede tener
  decenas de imagenes pesadas; eso se sube desde el admin para no inflar
  el repo.
- NO subir PDFs ni planos aca. Esos van por el admin tambien.

## Idempotencia

`seed_proyectos` carga la fachada SOLO cuando crea el proyecto por primera
vez (`created == True`). Si el proyecto ya existia (cualquier corrida
posterior), el seed NO toca la fachada aunque cambies el archivo en
`seed_assets/`. Asi protegemos las ediciones que Diana haya hecho desde el
admin.

## Estado actual

| Slug          | fachada.png |
| ------------- | ----------- |
| mira-verde    | si          |
| bolivar-205   | si          |
| parke-10      | si          |
| catolica      | si          |
| boreal        | si (de INFO_FALTANTE_IBYZA) |
| ibyza-tower   | NO disponible (proyecto en preventa, sin imagen del cliente) |

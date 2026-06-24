# 🐱 KitCrush — Match-3 de Gatitos

Un clon de Candy Crush con temática de gatitos, construido con Phaser 3 + TypeScript, exportable a Android con Capacitor.

## 🎮 Características

- **Tablero 8×8** con 6 tipos de gatitos
- **Match-3+** — horizontal, vertical, T-shape, L-shape, match-4, match-5
- **Cascadas** — piezas caen con gravedad + nuevas aparecen
- **Combos multiplicador** — x2, x3, x4...
- **Power-ups:**
  - ↔️ Destruye fila completa
  - ↕️ Destruye columna completa
  - 💥 Destruye área 3×3
  - 🌈 Destruye todos los de un color
- **15 niveles** con dificultad progresiva
- **Touch controls** — swipe o tap para jugar
- **Sonidos procedurales** — Web Audio API (sin archivos de audio)
- **Progresión guardada** — localStorage

## 🛠️ Stack

| Capa | Tecnología |
|------|-----------|
| Motor | Phaser 3 |
| Lenguaje | TypeScript |
| Bundler | Vite |
| Android | Capacitor |

## 🚀 Desarrollo

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo (hot reload)
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview
```

## 📱 Exportar a Android

### Prerrequisitos

- [Android Studio](https://developer.android.com/studio) instalado
- JDK 17+
- Android SDK 34+

### Pasos

```bash
# 1. Build del proyecto web
npm run build

# 2. Instalar Capacitor Android
npm install @capacitor/android

# 3. Añadir plataforma Android
npx cap add android

# 4. Sincronizar web → Android
npx cap sync android

# 5. Abrir en Android Studio
npx cap open android
```

### Desde Android Studio

1. **Run** → Ejecuta en emulador o dispositivo
2. **Build** → Generate Signed Bundle/APK para Play Store
3. El APK generado está en `android/app/build/outputs/`

### Configuración del WebView

El juego corre dentro de un WebView optimizado con:
- Full screen inmersivo
- Orientación portrait locked
- Scheme HTTPS (mejor rendimiento)
- StatusBar oscura

## 📁 Estructura

```
kitcrush/
├── src/
│   ├── main.ts              # Entry point
│   ├── config.ts            # Phaser config
│   ├── scenes/
│   │   ├── BootScene.ts     # Carga de assets
│   │   ├── MenuScene.ts     # Menú principal + selector de niveles
│   │   ├── GameScene.ts     # Gameplay core
│   │   └── GameOverScene.ts # Resultados
│   ├── objects/
│   │   ├── Board.ts         # Tablero 8×8 + lógica
│   │   └── Tile.ts          # Pieza individual (gatito)
│   ├── systems/
│   │   ├── MatchFinder.ts   # Detección de matches
│   │   ├── ScoreManager.ts  # Puntuación + combos
│   │   └── LevelManager.ts  # Progresión de niveles
│   └── utils/
│       ├── constants.ts     # Constantes del juego
│       └── sounds.ts        # Efectos de sonido procedurales
├── index.html
├── vite.config.ts
├── capacitor.config.json
└── package.json
```

## 🎨 Assets

Los gatitos se renderizan como emojis (😺😸😻🙀😹😽) sobre fondos de color generados proceduralmente. No se necesitan archivos de imagen externos.

## 📝 Licencia

MIT

// Castle Fortune — Asset Registration
// Uses the Pixi loader format expected by packages/pixi-svelte.

const spine = (srcAtlas, srcSkeleton) => ({
  type: 'spine',
  src: { atlas: srcAtlas, skeleton: srcSkeleton },
});

const sprite = (src) => ({
  type: 'sprite',
  src,
});

const font = (src) => ({
  type: 'font',
  src,
});

const audio = (src) => ({
  type: 'audio',
  src,
});

export const GAME_ASSETS = {
  H1: spine('/assests/spines/highSymbols/H1.atlas', '/assests/spines/highSymbols/H1.json'),
  H2: spine('/assests/spines/highSymbols/H2.atlas', '/assests/spines/highSymbols/H2.json'),
  H3: spine('/assests/spines/highSymbols/H3.atlas', '/assests/spines/highSymbols/H3.json'),
  H4: spine('/assests/spines/highSymbols/H4.atlas', '/assests/spines/highSymbols/H4.json'),

  LowSymbols: spine('/assests/spines/lowSymbols/LowSymbols.atlas', '/assests/spines/lowSymbols/LowSymbols.json'),

  Wild: spine('/assests/spines/specialSymbols/W.atlas', '/assests/spines/specialSymbols/W.json'),
  Scatter: spine('/assests/spines/specialSymbols/S.atlas', '/assests/spines/specialSymbols/S.json'),
  WinAnimations: spine('/assests/spines/wins/win.atlas', '/assests/spines/wins/win.json'),
  Reel: spine('/assests/spines/reel/Reel.atlas', '/assests/spines/reel/Reel.json'),
  BonusOptions: spine('/assests/spines/BonusOptions/bonusOptions.atlas', '/assests/spines/BonusOptions/bonusOptions.json'),
  BonusConfirmation: spine('/assests/spines/bonusComfirmation/bonusConfirmsAnimations.atlas', '/assests/spines/bonusComfirmation/bonusConfirmsAnimations.json'),

  // BaseGame background
  background_base: spine('/assests/spines/backgroundBase/BG.atlas', '/assests/spines/backgroundBase/BG.json'),
  //Bonus Background
  background_free: sprite('/assests/spines/backgroundBonus/BGB.webp'),
  //Super Bonus background
  background_super: sprite('/assests/spines/backgroundSuper/BGS.webp'),

  StartBackground: sprite('/assests/sprites/start/Castle%20Fortune%20Starting%20BG.png'),
  StartLogo: sprite('/assests/sprites/start/Castle%20Fortune%20Logo.png'),
  StartPressContinue: spine('/assests/sprites/start/PRESS%20TO%20CONTINUE.atlas', '/assests/sprites/start/PRESS%20TO%20CONTINUE.json'),
  StartBanners: spine('/assests/sprites/start/StartingScreenBanners.atlas', '/assests/sprites/start/StartingScreenBanners.json'),
  TransitionFlame: spine('/assests/sprites/transition/transitionFlame.atlas', '/assests/sprites/transition/transitionFlame.json'),

  HudBase: sprite('/assests/spines/hud/hubBase.png'),
  HudBonusButton: spine('/assests/spines/hud/bonusbuttonAnimations.atlas', '/assests/spines/hud/bonusbuttonAnimations.json'),
  HudInfo: spine('/assests/spines/hud/infoAnimations.atlas', '/assests/spines/hud/infoAnimations.json'),
  HudAutoSpin: spine('/assests/spines/hud/higherlowerAnimations.atlas', '/assests/spines/hud/higherlowerAnimations.json'),
  HudTurboButton: spine('/assests/spines/hud/higherlowerAnimations.atlas', '/assests/spines/hud/higherlowerAnimations.json'),
  HudBetHigher: spine('/assests/spines/hud/higherlowerAnimations.atlas', '/assests/spines/hud/higherlowerAnimations.json'),
  HudBetLower: spine('/assests/spines/hud/higherlowerAnimations.atlas', '/assests/spines/hud/higherlowerAnimations.json'),
  HudSpinButton: spine('/assests/spines/hud/spinButton.atlas', '/assests/spines/hud/spinButton.json'),
  HudMusicOnOff: spine('/assests/audio/HUD/musicOnOffAnimations.atlas', '/assests/audio/HUD/musicOnOffAnimations.json'),
  autoSpinBox: sprite('/assests/spines/hud/autospin-info-box.png'),
  infoBox: sprite('/assests/spines/hud/autospin-info-box.png'),
  HudBonusLemonSound: audio('/assests/audio/HUD/bonusLemonSounds.json'),
  HudOnOffAnimationSound: audio('/assests/audio/HUD/onOffAnimationSounds.json'),
  HudSpinButtonSound: audio('/assests/audio/HUD/spinButtonSound.json'),
  HudBetSizeSound: audio('/assests/audio/HUD/betSizeSound.json'),
  CFAnticipationSound: audio('/assests/audio/cFSounds/anticipationSound.json'),
  CFBaseMusic: audio('/assests/audio/cFSounds/baseMusic.json'),
  CFBonusMusic: audio('/assests/audio/cFSounds/bonusMusic.json'),
  CFConnectingSound: audio('/assests/audio/cFSounds/connectingSound.json'),
  CFFlameTransitionSound: audio('/assests/audio/cFSounds/flameTransitionSound.json'),
  CFFsLand: audio('/assests/audio/cFSounds/fsLand.json'),
  CFSymbolsLanding: audio('/assests/audio/cFSounds/symbolsLanding.json'),
  CFWinCount: audio('/assests/audio/cFSounds/winCount.json'),
  CFWinEnd: audio('/assests/audio/cFSounds/winEnd.json'),

  GoldFontLetters: font('/assests/fonts/gold/gold_font.json'),
  GoldFontNumbers: font('/assests/fonts/gold/gold_font_num.json'),
  BlueFontLetters: font('/assests/fonts/blue/blue_font.json'),
  BlueFontNumbers: font('/assests/fonts/blue/blue_numbers.json'),
  RedFontLetters: font('/assests/fonts/red/red_font.json'),
  RedFontNumbers: font('/assests/fonts/red/red_numbers.json'),
  WhiteFontLetters: font('/assests/fonts/white/plainCfFont.xml'),
  WhiteFontNumbers: font('/assests/fonts/white/plainCfNumbers.xml'),
};

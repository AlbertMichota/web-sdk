<script>
  import { onDestroy } from 'svelte';
  import { BitmapText, Container, Graphics, Rectangle, Sprite, SpineProvider, SpineTrack } from 'pixi-svelte';
  import { getContext } from '../game/context.js';
  import SetSpineAttachment from './SetSpineAttachment.svelte';
  import SpineSkin from './SpineSkin.svelte';
  import { closeHudBoxes, hudOverlayState, showBonusConfirmation } from './hudOverlayState.svelte.js';
  import { triggerReelSpinActive } from './reelAnimationState.svelte.js';
  import { BASE_BOOKS } from '../stories/data/base_books.js';
  import { setHudMusicVolume, setHudSoundEffectVolume } from './hudSoundState.svelte.js';
  import { playHudOnOffSound, setBaseMusicVolume } from './hudSounds.svelte.js';
  import {
    HUD_CENTER_Y_RATIO,
    HUD_OFFSET_X,
    HUD_OFFSET_Y,
    getHudScale,
    hudAssetX,
    hudAssetY,
  } from './hudLayout.js';

  const BOX_NATIVE_WIDTH = 2830;
  const BOX_NATIVE_HEIGHT = 1471;

  const AUTO_SPIN_BOX_OFFSET_X = 1145;
  const AUTO_SPIN_BOX_OFFSET_Y = -255;
  const AUTO_SPIN_BOX_SCALE_MULTIPLIER = 1;
  const AUTO_SPIN_OPTION_SCALE_MULTIPLIER = 0.7;
  const AUTO_SPIN_OPTION_HIT_SIZE = 120;
  const AUTO_SPIN_OPTION_ANIMATION_DURATION = 350;
  const AUTO_SPIN_OPTIONS = [
    { skin: 'autospinHigher', offsetX: AUTO_SPIN_BOX_OFFSET_X + 100, offsetY: AUTO_SPIN_BOX_OFFSET_Y -25, hideAtMaxValue: true },
    { skin: 'autospinLower', offsetX: AUTO_SPIN_BOX_OFFSET_X - 100, offsetY: AUTO_SPIN_BOX_OFFSET_Y - 25, hideAtMinValue: true },
  ];
  const AUTO_SPIN_VALUES = [10, 25, 50, 100, 250, 500, 1000];
  const AUTO_SPIN_VALUE_OFFSET_X = AUTO_SPIN_BOX_OFFSET_X;
  const AUTO_SPIN_VALUE_OFFSET_Y = AUTO_SPIN_BOX_OFFSET_Y - 25;
  const AUTO_SPIN_VALUE_FONT_SIZE = 110;
  const AUTO_SPIN_VALUE_BOX_WIDTH = 140;
  const AUTO_SPIN_VALUE_BOX_HEIGHT = 70;
  const AUTO_SPIN_CONFIRM_TEXT = 'CONFIRM';
  const AUTO_SPIN_CONFIRM_OFFSET_X = AUTO_SPIN_BOX_OFFSET_X;
  const AUTO_SPIN_CONFIRM_OFFSET_Y = AUTO_SPIN_BOX_OFFSET_Y + 55;
  const AUTO_SPIN_CONFIRM_FONT_SIZE = 72;
  const AUTO_SPIN_CONFIRM_BOX_WIDTH = 330;
  const AUTO_SPIN_CONFIRM_BOX_HEIGHT = 80;
  const AUTO_SPIN_CONFIRM_COLOR = 0xffffff;
  const AUTO_SPIN_CONFIRM_HOVER_COLOR = 0xffd200;

  const INFO_BOX_OFFSET_X = -600;
  const INFO_BOX_OFFSET_Y = -235;
  const INFO_BOX_SCALE_MULTIPLIER = 1.2;
  const INFO_BOX_SLOTINFO_OFFSET_X = 0;
  const INFO_BOX_SLOTINFO_OFFSET_Y = 60;
  const INFO_BOX_SLOTINFO_SCALE_MULTIPLIER = 0.7;
  const INFO_BOX_SLOTINFO_HIT_WIDTH = 260;
  const INFO_BOX_SLOTINFO_HIT_HEIGHT = 120;
  const INFO_BOX_VOLUME_ONE_OFFSET_X = -105;
  const INFO_BOX_VOLUME_ONE_OFFSET_Y = 0;
  const INFO_BOX_VOLUME_ONE_SCALE_MULTIPLIER = 0.4;
  const INFO_BOX_VOLUME_TWO_OFFSET_X = -105;
  const INFO_BOX_VOLUME_TWO_OFFSET_Y = -65;
  const INFO_BOX_VOLUME_TWO_SCALE_MULTIPLIER = 0.6;
  const INFO_BOX_VOLUME_HIT_WIDTH = 80;
  const INFO_BOX_VOLUME_HIT_HEIGHT = 56;
  const INFO_BOX_VOLUME_ANIMATION_DURATION = 300;
  const INFO_BOX_VOLUME_SLIDER_OFFSET_X = 138;
  const INFO_BOX_VOLUME_SLIDER_OFFSET_Y = 0;
  const INFO_BOX_VOLUME_SLIDER_WIDTH = 210;
  const INFO_BOX_VOLUME_SLIDER_HEIGHT = 28;
  const INFO_BOX_VOLUME_SLIDER_RADIUS = 12;
  const INFO_BOX_VOLUME_SLIDER_FILL_COLOR = 0xffd200;
  const INFO_BOX_VOLUME_SLIDER_KNOB_WIDTH = 18;
  const INFO_BOX_VOLUME_SLIDER_KNOB_HEIGHT = 46;
  const INFO_BOX_VOLUME_SLIDER_KNOB_RADIUS = 8;
  const INFO_BOX_SOUND_EFFECT_VOLUME_INDEX = 0;
  const INFO_BOX_MUSIC_VOLUME_INDEX = 1;

  const INFO_BOX_VOLUME_BUTTONS = [
    {
      offsetX: INFO_BOX_VOLUME_ONE_OFFSET_X,
      offsetY: INFO_BOX_VOLUME_ONE_OFFSET_Y,
      iconScaleMultiplier: INFO_BOX_VOLUME_TWO_SCALE_MULTIPLIER,
      assetKey: 'HudAutoSpin',
      skinOnOff: 'onoffvolumeButton',
      skinOffOn: 'offonvolumeButton',
    },
    {
      offsetX: INFO_BOX_VOLUME_TWO_OFFSET_X,
      offsetY: INFO_BOX_VOLUME_TWO_OFFSET_Y,
      iconScaleMultiplier: INFO_BOX_VOLUME_ONE_SCALE_MULTIPLIER,
      assetKey: 'HudMusicOnOff',
      skinOnOff: 'musicButtonOnOff',
      skinOffOn: 'musicButtonOffOn',
    },
  ];

  const BONUS_OPTIONS = [
    { skin: 'doubleChance', offsetX: -700 },
    { skin: 'fortuneSpin', offsetX: -350 },
    { skin: 'hiddenBonus', offsetX: 700 },
    { skin: 'regluarBonus', offsetX: 0 },
    { skin: 'superBonus', offsetX: 350 },
  ];
  const BONUS_OPTIONS_OFFSET_Y = -650;
  const BONUS_OPTIONS_BASE_SCALE = 0.55;
  const BONUS_OPTIONS_GROUP_SCALE = 0.75;
  const BONUS_OPTIONS_BACKDROP_ALPHA = 0.55;
  const BONUS_OPTIONS_ACTIVATE_HIT_WIDTH = 420;
  const BONUS_OPTIONS_ACTIVATE_HIT_HEIGHT = 70;
  const BONUS_OPTIONS_ACTIVATE_HIT_OFFSET_X = 0;
  const BONUS_OPTIONS_ACTIVATE_HIT_OFFSET_Y = 122;
  const BONUS_OPTIONS_CONFIRM_DELAY = 300;
  const BONUS_OPTIONS_ARROW_SCALE = 0.65;
  const BONUS_OPTIONS_ARROW_OFFSET_Y = 50;
  const BONUS_OPTIONS_ARROW_HIT_SIZE = 160;
  const BONUS_OPTIONS_ARROW_ANIMATION_DURATION = 350;
  const BONUS_OPTIONS_ARROWS = [
    { skin: 'autospinLower', offsetX: -795 },
    { skin: 'autospinHigher', offsetX: -605 },
  ];
  const BONUS_CONFIRMATION_SCALE_MULTIPLIER = 1;
  const BONUS_CONFIRMATION_HIT_WIDTH = 650;
  const BONUS_CONFIRMATION_HIT_HEIGHT = 180;
  const BONUS_CONFIRMATION_HIT_OFFSET_Y = 255;
  const BONUS_CONFIRMATION_CLOSE_DELAY = 250;

  let activeBonusOptionSkin = $state('');
  let bonusOptionPressCount = $state(0);
  let bonusOptionConfirmTimeout;
  let bonusConfirmationAnimating = $state(false);
  let bonusConfirmationPressCount = $state(0);
  let bonusConfirmationCloseTimeout;
  let activeBonusOptionsArrowSkin = $state('');
  let bonusOptionsArrowPressCount = $state(0);
  let bonusOptionsArrowAnimationTimeout;
  let wasBonusOptionsVisible = false;
  let activeAutoSpinOptionSkin = $state('');
  let autoSpinOptionPressCount = $state(0);
  let autoSpinValueIndex = $state(0);
  let autoSpinValueMeasuredSize = $state({ width: 1, height: 1 });
  let autoSpinConfirmMeasuredSize = $state({ width: 1, height: 1 });
  let autoSpinConfirmHovered = $state(false);
  let autoSpinRunning = $state(false);
  let wasAutoSpinBoxVisible = false;
  let autoSpinOptionAnimationTimeout;
  let infoBoxSlotInfoHovered = $state(false);
  let infoBoxVolumeActive = $state([false, false]);
  let infoBoxVolumeTargetActive = $state([false, false]);
  let infoBoxVolumeAnimating = $state([false, false]);
  let infoBoxVolumePressCounts = $state([0, 0]);
  let infoBoxVolumeValues = $state([1, 1]);
  let infoBoxVolumePreviousValues = $state([1, 1]);
  let infoBoxVolumeDragging = $state([false, false]);
  let infoBoxVolumePressed = $state([false, false]);
  let infoBoxVolumeSuppressClick = $state([false, false]);
  let infoBoxVolumeAnimationTimeouts = [];
  let infoBoxVolumeSuppressTimeouts = [];

  const context = getContext();
  const { bookPlayer, stateApp, stateLayoutDerived } = context;

  const w = $derived(stateLayoutDerived.canvasSizes().width);
  const h = $derived(stateLayoutDerived.canvasSizes().height);

  const hudScale = $derived(getHudScale(w, h));
  const hudCenterX = $derived(w / 2 + HUD_OFFSET_X * hudScale);
  const hudCenterY = $derived(h * HUD_CENTER_Y_RATIO + HUD_OFFSET_Y * hudScale);
  const autoSpinValueFitRatio = $derived(Math.min(
    1,
    AUTO_SPIN_VALUE_BOX_WIDTH / Math.max(autoSpinValueMeasuredSize.width, 1),
    AUTO_SPIN_VALUE_BOX_HEIGHT / Math.max(autoSpinValueMeasuredSize.height, 1)
  ));
  const autoSpinValueFontSize = $derived(AUTO_SPIN_VALUE_FONT_SIZE * autoSpinValueFitRatio * hudScale);
  const autoSpinConfirmFitRatio = $derived(Math.min(
    1,
    AUTO_SPIN_CONFIRM_BOX_WIDTH / Math.max(autoSpinConfirmMeasuredSize.width, 1),
    AUTO_SPIN_CONFIRM_BOX_HEIGHT / Math.max(autoSpinConfirmMeasuredSize.height, 1)
  ));
  const autoSpinConfirmFontSize = $derived(AUTO_SPIN_CONFIRM_FONT_SIZE * autoSpinConfirmFitRatio * hudScale);

  function boxX(offsetX = 0) {
    return hudAssetX(hudCenterX, hudScale, offsetX);
  }

  function boxY(offsetY = 0) {
    return hudAssetY(hudCenterY, hudScale, offsetY);
  }

  function boxWidth(scaleMultiplier = 1) {
    return BOX_NATIVE_WIDTH * hudScale * scaleMultiplier;
  }

  function boxHeight(scaleMultiplier = 1) {
    return BOX_NATIVE_HEIGHT * hudScale * scaleMultiplier;
  }

  function volumeSliderX() {
    return INFO_BOX_VOLUME_SLIDER_OFFSET_X;
  }

  function bonusOptionX(offsetX = 0) {
    return offsetX / BONUS_OPTIONS_BASE_SCALE;
  }

  function playBonusOptionAnimation(skin) {
    activeBonusOptionSkin = skin;
    bonusOptionPressCount += 1;

    const confirmationSkinMap = {
      doubleChance: 'doubleChanceconfirm',
      fortuneSpin: 'fortuneSpinconfirm',
      hiddenBonus: 'hiddenBonusconfirm',
      regluarBonus: 'regularBonusconfirm',
      superBonus: 'superBonusconfirm',
    };
    const confirmationSkin = confirmationSkinMap[skin];

    if (confirmationSkin) {
      clearTimeout(bonusOptionConfirmTimeout);
      bonusConfirmationAnimating = false;
      bonusOptionConfirmTimeout = setTimeout(() => {
        showBonusConfirmation(confirmationSkin);
      }, BONUS_OPTIONS_CONFIRM_DELAY);
      return;
    }
  }

  function playBonusOptionsArrowAnimation(skin) {
    playHudOnOffSound();
    activeBonusOptionsArrowSkin = skin;
    bonusOptionsArrowPressCount += 1;

    clearTimeout(bonusOptionsArrowAnimationTimeout);
    bonusOptionsArrowAnimationTimeout = setTimeout(() => {
      activeBonusOptionsArrowSkin = '';
    }, BONUS_OPTIONS_ARROW_ANIMATION_DURATION);
  }

  function playBonusConfirmationAnimation() {
    clearTimeout(bonusConfirmationCloseTimeout);
    bonusConfirmationAnimating = true;
    bonusConfirmationPressCount += 1;
    bonusConfirmationCloseTimeout = setTimeout(() => {
      closeHudBoxes();
    }, BONUS_CONFIRMATION_CLOSE_DELAY);
  }

  function playAutoSpinOptionAnimation(skin) {
    playHudOnOffSound();
    activeAutoSpinOptionSkin = skin;
    autoSpinOptionPressCount += 1;

    if (skin === 'autospinHigher') {
      autoSpinValueIndex = Math.min(autoSpinValueIndex + 1, AUTO_SPIN_VALUES.length - 1);
    }

    if (skin === 'autospinLower') {
      autoSpinValueIndex = Math.max(autoSpinValueIndex - 1, 0);
    }

    clearTimeout(autoSpinOptionAnimationTimeout);
    autoSpinOptionAnimationTimeout = setTimeout(() => {
      activeAutoSpinOptionSkin = '';
    }, AUTO_SPIN_OPTION_ANIMATION_DURATION);
  }

  async function confirmAutoSpinValue() {
    if (autoSpinRunning) return;

    autoSpinRunning = true;
    playHudOnOffSound();
    closeHudBoxes();

    const spinCount = AUTO_SPIN_VALUES[autoSpinValueIndex];

    try {
      for (let spinIndex = 0; spinIndex < spinCount; spinIndex += 1) {
        triggerReelSpinActive();
        await bookPlayer.playBook(BASE_BOOKS['zero_win']);
      }
    } catch (error) {
      console.error('[HudInfoBoxes] Failed to play auto spin book', error);
    } finally {
      autoSpinRunning = false;
    }
  }

  function setInfoBoxVolumeChannel(index, value) {
    if (index === INFO_BOX_SOUND_EFFECT_VOLUME_INDEX) {
      setHudSoundEffectVolume(value);
    }

    if (index === INFO_BOX_MUSIC_VOLUME_INDEX) {
      setHudMusicVolume(value);
      setBaseMusicVolume(value);
    }
  }

  function playInfoBoxVolumeAnimation(index) {
    if (!infoBoxVolumePressed[index]) return;

    if (infoBoxVolumeSuppressClick[index]) {
      infoBoxVolumeSuppressClick[index] = false;
      infoBoxVolumePressed[index] = false;
      return;
    }

    infoBoxVolumePressed[index] = false;
    clearTimeout(infoBoxVolumeAnimationTimeouts[index]);
    infoBoxVolumeTargetActive[index] = !infoBoxVolumeActive[index];
    playHudOnOffSound();
    if (infoBoxVolumeTargetActive[index]) {
      if (infoBoxVolumeValues[index] > 0) {
        infoBoxVolumePreviousValues[index] = infoBoxVolumeValues[index];
      }
      infoBoxVolumeValues[index] = 0;
    } else {
      infoBoxVolumeValues[index] = infoBoxVolumePreviousValues[index] || 1;
    }
    setInfoBoxVolumeChannel(index, infoBoxVolumeValues[index]);
    infoBoxVolumeAnimating[index] = true;
    infoBoxVolumePressCounts[index] += 1;
    infoBoxVolumeAnimationTimeouts[index] = setTimeout(() => {
      infoBoxVolumeAnimating[index] = false;
      infoBoxVolumeActive[index] = infoBoxVolumeTargetActive[index];
    }, INFO_BOX_VOLUME_ANIMATION_DURATION);
  }

  function pointerGlobalX(event) {
    return event?.global?.x ?? event?.data?.global?.x ?? 0;
  }

  function setInfoBoxVolumeFromPointer(index, event) {
    const volumeButton = INFO_BOX_VOLUME_BUTTONS[index];
    const sliderLeft = (
      boxX(INFO_BOX_OFFSET_X)
      + volumeButton.offsetX * hudScale
      + (volumeSliderX() - INFO_BOX_VOLUME_SLIDER_WIDTH / 2) * hudScale
    );
    const sliderWidth = INFO_BOX_VOLUME_SLIDER_WIDTH * hudScale;
    const value = Math.max(0, Math.min(1, (pointerGlobalX(event) - sliderLeft) / sliderWidth));
    infoBoxVolumeValues[index] = value;
    setInfoBoxVolumeChannel(index, value);
    if (value > 0) {
      infoBoxVolumePreviousValues[index] = value;
    }
    clearTimeout(infoBoxVolumeAnimationTimeouts[index]);
    infoBoxVolumeAnimating[index] = false;
    infoBoxVolumeTargetActive[index] = value === 0;
    infoBoxVolumeActive[index] = value === 0;
  }

  function startInfoBoxVolumeDrag(index, event) {
    event?.stopPropagation?.();
    infoBoxVolumePressed[index] = false;
    infoBoxVolumeDragging[index] = true;
    setInfoBoxVolumeFromPointer(index, event);
  }

  function dragInfoBoxVolume(index, event) {
    if (!infoBoxVolumeDragging[index]) return;
    event?.stopPropagation?.();
    setInfoBoxVolumeFromPointer(index, event);
  }

  function stopInfoBoxVolumeDrag(index, event) {
    event?.stopPropagation?.();
    infoBoxVolumeDragging[index] = false;
    infoBoxVolumePressed[index] = false;
    infoBoxVolumeSuppressClick[index] = true;
    clearTimeout(infoBoxVolumeSuppressTimeouts[index]);
    infoBoxVolumeSuppressTimeouts[index] = setTimeout(() => {
      infoBoxVolumeSuppressClick[index] = false;
    }, 50);
  }

  $effect(() => {
    if (hudOverlayState.bonusOptionsVisible && !wasBonusOptionsVisible) {
      clearTimeout(bonusOptionConfirmTimeout);
      activeBonusOptionSkin = '';
      bonusOptionPressCount = 0;
      activeBonusOptionsArrowSkin = '';
      bonusOptionsArrowPressCount = 0;
      bonusConfirmationAnimating = false;
      bonusConfirmationPressCount = 0;
    }

    wasBonusOptionsVisible = hudOverlayState.bonusOptionsVisible;

    if (!hudOverlayState.autoSpinBoxVisible) {
      activeAutoSpinOptionSkin = '';
      autoSpinConfirmHovered = false;
    }

    if (hudOverlayState.autoSpinBoxVisible && !wasAutoSpinBoxVisible) {
      autoSpinValueIndex = 0;
      activeAutoSpinOptionSkin = '';
    }

    wasAutoSpinBoxVisible = hudOverlayState.autoSpinBoxVisible;
  });

  onDestroy(() => {
    clearTimeout(bonusOptionConfirmTimeout);
    clearTimeout(bonusConfirmationCloseTimeout);
    clearTimeout(bonusOptionsArrowAnimationTimeout);
    clearTimeout(autoSpinOptionAnimationTimeout);
    infoBoxVolumeAnimationTimeouts.forEach(clearTimeout);
    infoBoxVolumeSuppressTimeouts.forEach(clearTimeout);
  });
</script>

{#snippet spineChildren()}{/snippet}

{#if stateApp.loaded && hudOverlayState.autoSpinBoxVisible && stateApp.loadedAssets.autoSpinBox}
  <Sprite
    key="autoSpinBox"
    x={boxX(AUTO_SPIN_BOX_OFFSET_X)}
    y={boxY(AUTO_SPIN_BOX_OFFSET_Y)}
    anchor={{ x: 0.5, y: 0.5 }}
    width={boxWidth(AUTO_SPIN_BOX_SCALE_MULTIPLIER)}
    height={boxHeight(AUTO_SPIN_BOX_SCALE_MULTIPLIER)}
    zIndex={20}
  />
{/if}

{#if stateApp.loaded && hudOverlayState.autoSpinBoxVisible && stateApp.loadedAssets.autoSpinBox}
  <BitmapText
    text={`${AUTO_SPIN_VALUES[autoSpinValueIndex]}`}
    x={-99999}
    y={-99999}
    onresize={(size) => {
      autoSpinValueMeasuredSize = {
        width: size.width / Math.max(hudScale, 0.0001),
        height: size.height / Math.max(hudScale, 0.0001),
      };
    }}
    style={{
      fontFamily: 'plainCfNumbers',
      fontSize: AUTO_SPIN_VALUE_FONT_SIZE * hudScale,
      fill: 0xffffff,
      align: 'center',
    }}
    zIndex={-1}
  />

  <BitmapText
    text={AUTO_SPIN_CONFIRM_TEXT}
    x={-99999}
    y={-99999}
    onresize={(size) => {
      autoSpinConfirmMeasuredSize = {
        width: size.width / Math.max(hudScale, 0.0001),
        height: size.height / Math.max(hudScale, 0.0001),
      };
    }}
    style={{
      fontFamily: 'plainCfFont',
      fontSize: AUTO_SPIN_CONFIRM_FONT_SIZE * hudScale,
      fill: 0xffffff,
      align: 'center',
    }}
    zIndex={-1}
  />

  <BitmapText
    text={`${AUTO_SPIN_VALUES[autoSpinValueIndex]}`}
    x={boxX(AUTO_SPIN_VALUE_OFFSET_X)}
    y={boxY(AUTO_SPIN_VALUE_OFFSET_Y)}
    anchor={{ x: 0.5, y: 0.5 }}
    style={{
      fontFamily: 'plainCfNumbers',
      fontSize: autoSpinValueFontSize,
      fill: 0xffffff,
      align: 'center',
    }}
    zIndex={22}
  />

  <BitmapText
    text={AUTO_SPIN_CONFIRM_TEXT}
    x={boxX(AUTO_SPIN_CONFIRM_OFFSET_X)}
    y={boxY(AUTO_SPIN_CONFIRM_OFFSET_Y)}
    anchor={{ x: 0.5, y: 0.5 }}
    style={{
      fontFamily: 'plainCfFont',
      fontSize: autoSpinConfirmFontSize,
      fill: autoSpinConfirmHovered ? AUTO_SPIN_CONFIRM_HOVER_COLOR : AUTO_SPIN_CONFIRM_COLOR,
      align: 'center',
    }}
    zIndex={22}
  />

  <Rectangle
    x={boxX(AUTO_SPIN_CONFIRM_OFFSET_X)}
    y={boxY(AUTO_SPIN_CONFIRM_OFFSET_Y)}
    width={AUTO_SPIN_CONFIRM_BOX_WIDTH * hudScale}
    height={AUTO_SPIN_CONFIRM_BOX_HEIGHT * hudScale}
    anchor={{ x: 0.5, y: 0.5 }}
    backgroundAlpha={0}
    eventMode="static"
    cursor="pointer"
    zIndex={23}
    onpointerover={() => { autoSpinConfirmHovered = true; }}
    onpointerout={() => { autoSpinConfirmHovered = false; }}
    onpointerup={confirmAutoSpinValue}
  />
{/if}

{#if stateApp.loaded && hudOverlayState.autoSpinBoxVisible && stateApp.loadedAssets.HudAutoSpin}
  {#each AUTO_SPIN_OPTIONS as option (option.skin)}
    {#if (!option.hideAtMinValue || autoSpinValueIndex > 0) && (!option.hideAtMaxValue || autoSpinValueIndex < AUTO_SPIN_VALUES.length - 1)}
      <Container
        x={boxX(option.offsetX)}
        y={boxY(option.offsetY)}
        scale={{
          x: hudScale * AUTO_SPIN_OPTION_SCALE_MULTIPLIER,
          y: hudScale * AUTO_SPIN_OPTION_SCALE_MULTIPLIER,
        }}
        zIndex={21}
      >
        <SpineProvider key="HudAutoSpin" alpha={activeAutoSpinOptionSkin === option.skin ? 0 : 1}>
          <SpineSkin skinName={option.skin} />
          <SetSpineAttachment slotName="autospinOff" attachmentName="off" />
          <SetSpineAttachment slotName="autospinOn" attachmentName={null} />
          {@render spineChildren()}
        </SpineProvider>

        {#if activeAutoSpinOptionSkin === option.skin}
          {#key `${option.skin}:${autoSpinOptionPressCount}`}
            <SpineProvider key="HudAutoSpin">
              <SpineSkin skinName={option.skin} />
              <SetSpineAttachment slotName="autospinOff" attachmentName={null} />
              <SetSpineAttachment slotName="autospinOn" attachmentName="on" />
              <SpineTrack trackIndex={0} animationName="animation" loop={false} />
              {@render spineChildren()}
            </SpineProvider>
          {/key}
        {/if}

        <Rectangle
          width={AUTO_SPIN_OPTION_HIT_SIZE}
          height={AUTO_SPIN_OPTION_HIT_SIZE}
          anchor={{ x: 0.5, y: 0.5 }}
          backgroundAlpha={0}
          eventMode="static"
          cursor="pointer"
          onpointerup={() => playAutoSpinOptionAnimation(option.skin)}
        />
      </Container>
    {/if}
  {/each}
{/if}

{#if stateApp.loaded && (hudOverlayState.bonusOptionsVisible || hudOverlayState.bonusConfirmationVisible)}
  <Rectangle
    x={w / 2}
    y={h / 2}
    width={w}
    height={h}
    anchor={{ x: 0.5, y: 0.5 }}
    backgroundColor={0x000000}
    backgroundAlpha={BONUS_OPTIONS_BACKDROP_ALPHA}
    zIndex={19}
  />
{/if}

{#if stateApp.loaded && hudOverlayState.bonusOptionsVisible && stateApp.loadedAssets.BonusOptions}
  <Container
    x={boxX(0)}
    y={boxY(BONUS_OPTIONS_OFFSET_Y)}
    scale={{
      x: hudScale * BONUS_OPTIONS_GROUP_SCALE,
      y: hudScale * BONUS_OPTIONS_GROUP_SCALE,
    }}
    zIndex={20}
  >
    {#each BONUS_OPTIONS as option (option.skin)}
      <Container x={bonusOptionX(option.offsetX)} y={0}>
        <SpineProvider key="BonusOptions">
          <SpineSkin skinName={option.skin} />
          {#if activeBonusOptionSkin === option.skin}
            {#key `${option.skin}:${bonusOptionPressCount}`}
              <SpineTrack trackIndex={0} animationName="animation" loop={false} />
            {/key}
          {/if}
        </SpineProvider>

        <Rectangle
          x={BONUS_OPTIONS_ACTIVATE_HIT_OFFSET_X}
          y={BONUS_OPTIONS_ACTIVATE_HIT_OFFSET_Y}
          width={BONUS_OPTIONS_ACTIVATE_HIT_WIDTH}
          height={BONUS_OPTIONS_ACTIVATE_HIT_HEIGHT}
          anchor={{ x: 0.5, y: 0.5 }}
          backgroundColor={0x00ff00}
          backgroundAlpha={0.3}
          eventMode="static"
          cursor="pointer"
          onpointerup={() => playBonusOptionAnimation(option.skin)}
        />
      </Container>
    {/each}

    {#if stateApp.loadedAssets.HudAutoSpin}
      {#each BONUS_OPTIONS_ARROWS as arrow (arrow.skin)}
        <Container
          x={bonusOptionX(arrow.offsetX)}
          y={BONUS_OPTIONS_ARROW_OFFSET_Y}
          scale={{
            x: BONUS_OPTIONS_ARROW_SCALE,
            y: BONUS_OPTIONS_ARROW_SCALE,
          }}
        >
          <SpineProvider key="HudAutoSpin" alpha={activeBonusOptionsArrowSkin === arrow.skin ? 0 : 1}>
            <SpineSkin skinName={arrow.skin} />
            <SetSpineAttachment slotName="autospinOff" attachmentName="off" />
            <SetSpineAttachment slotName="autospinOn" attachmentName={null} />
          </SpineProvider>

          {#if activeBonusOptionsArrowSkin === arrow.skin}
            {#key `${arrow.skin}:${bonusOptionsArrowPressCount}`}
              <SpineProvider key="HudAutoSpin">
                <SpineSkin skinName={arrow.skin} />
                <SetSpineAttachment slotName="autospinOff" attachmentName={null} />
                <SetSpineAttachment slotName="autospinOn" attachmentName="on" />
                <SpineTrack trackIndex={0} animationName="animation" loop={false} />
              </SpineProvider>
            {/key}
          {/if}

          <Rectangle
            width={BONUS_OPTIONS_ARROW_HIT_SIZE}
            height={BONUS_OPTIONS_ARROW_HIT_SIZE}
            anchor={{ x: 0.5, y: 0.5 }}
            backgroundAlpha={0}
            eventMode="static"
            cursor="pointer"
            onpointerup={() => playBonusOptionsArrowAnimation(arrow.skin)}
          />
        </Container>
      {/each}
    {/if}
  </Container>
{/if}

{#if stateApp.loaded && hudOverlayState.bonusConfirmationVisible && stateApp.loadedAssets.BonusConfirmation}
  <Container
    x={w / 2}
    y={h / 2}
    scale={{
      x: hudScale * BONUS_CONFIRMATION_SCALE_MULTIPLIER,
      y: hudScale * BONUS_CONFIRMATION_SCALE_MULTIPLIER,
    }}
    zIndex={20}
  >
    <SpineProvider key="BonusConfirmation">
      <SpineSkin skinName={hudOverlayState.bonusConfirmationSkin} />
      {#if bonusConfirmationAnimating}
        {#key bonusConfirmationPressCount}
          <SpineTrack trackIndex={0} animationName="animation" loop={false} />
        {/key}
      {/if}
    </SpineProvider>

    <Rectangle
      y={BONUS_CONFIRMATION_HIT_OFFSET_Y}
      width={BONUS_CONFIRMATION_HIT_WIDTH}
      height={BONUS_CONFIRMATION_HIT_HEIGHT}
      anchor={{ x: 0.5, y: 0.5 }}
      backgroundAlpha={0}
      eventMode="static"
      cursor="pointer"
      onpointerup={playBonusConfirmationAnimation}
    />
  </Container>
{/if}

{#if stateApp.loaded && hudOverlayState.infoBoxVisible && stateApp.loadedAssets.infoBox}
  <Container
    x={boxX(INFO_BOX_OFFSET_X)}
    y={boxY(INFO_BOX_OFFSET_Y)}
    zIndex={20}
  >
    <Sprite
      key="infoBox"
      anchor={{ x: 0.5, y: 0.5 }}
      width={boxWidth(INFO_BOX_SCALE_MULTIPLIER)}
      height={boxHeight(INFO_BOX_SCALE_MULTIPLIER)}
    />

    {#if stateApp.loadedAssets.HudInfo}
      <Container
        x={INFO_BOX_SLOTINFO_OFFSET_X * hudScale}
        y={INFO_BOX_SLOTINFO_OFFSET_Y * hudScale}
        scale={{
          x: hudScale * INFO_BOX_SLOTINFO_SCALE_MULTIPLIER,
          y: hudScale * INFO_BOX_SLOTINFO_SCALE_MULTIPLIER,
        }}
      >
        <SpineProvider key="HudInfo">
          <SpineSkin skinName="slotinfo" />
          <SetSpineAttachment slotName="off" attachmentName={infoBoxSlotInfoHovered ? null : 'off'} />
          <SetSpineAttachment slotName="on" attachmentName={infoBoxSlotInfoHovered ? 'on' : null} />
        </SpineProvider>

        <Rectangle
          width={INFO_BOX_SLOTINFO_HIT_WIDTH}
          height={INFO_BOX_SLOTINFO_HIT_HEIGHT}
          anchor={{ x: 0.5, y: 0.5 }}
          backgroundAlpha={0}
          eventMode="static"
          cursor="pointer"
          onpointerover={() => { infoBoxSlotInfoHovered = true; }}
          onpointerout={() => { infoBoxSlotInfoHovered = false; }}
          onpointerup={playHudOnOffSound}
        />
      </Container>
    {/if}

    {#each INFO_BOX_VOLUME_BUTTONS as volumeButton, volumeButtonIndex (volumeButtonIndex)}
      {#if stateApp.loadedAssets[volumeButton.assetKey]}
      <Container
        x={volumeButton.offsetX * hudScale}
        y={volumeButton.offsetY * hudScale}
        sortableChildren={true}
      >
        <SpineProvider
          key={volumeButton.assetKey}
          scale={{
            x: hudScale * volumeButton.iconScaleMultiplier,
            y: hudScale * volumeButton.iconScaleMultiplier,
          }}
        >
          <SpineSkin
            skinName={
              infoBoxVolumeAnimating[volumeButtonIndex] && !infoBoxVolumeTargetActive[volumeButtonIndex]
                ? volumeButton.skinOffOn
                : volumeButton.skinOnOff
            }
          />
          <SetSpineAttachment
            slotName="autospinOff"
            attachmentName={infoBoxVolumeActive[volumeButtonIndex] && !infoBoxVolumeAnimating[volumeButtonIndex] ? null : 'off'}
          />
          <SetSpineAttachment
            slotName="autospinOn"
            attachmentName={infoBoxVolumeActive[volumeButtonIndex] || infoBoxVolumeAnimating[volumeButtonIndex] ? 'on' : null}
          />
          {#if infoBoxVolumeAnimating[volumeButtonIndex]}
            {#key `${volumeButtonIndex}:${infoBoxVolumePressCounts[volumeButtonIndex]}`}
              <SpineTrack trackIndex={0} animationName="animation" loop={false} />
            {/key}
          {/if}
        </SpineProvider>

        <Rectangle
          width={INFO_BOX_VOLUME_HIT_WIDTH}
          height={INFO_BOX_VOLUME_HIT_HEIGHT}
          anchor={{ x: 0.5, y: 0.5 }}
          backgroundAlpha={0}
          eventMode="static"
          cursor="pointer"
          zIndex={1}
          onpointerdown={() => { infoBoxVolumePressed[volumeButtonIndex] = true; }}
          onpointerup={() => playInfoBoxVolumeAnimation(volumeButtonIndex)}
          onpointerupoutside={() => { infoBoxVolumePressed[volumeButtonIndex] = false; }}
          onpointerout={() => { infoBoxVolumePressed[volumeButtonIndex] = false; }}
        />

        <Container
          x={volumeSliderX() * hudScale}
          y={INFO_BOX_VOLUME_SLIDER_OFFSET_Y * hudScale}
          scale={{ x: hudScale, y: hudScale }}
          zIndex={2}
        >
          <Graphics
            draw={(g) => {
              g.clear();
              g.beginFill(0x1b1024, 0.75);
              g.drawRoundedRect(
                -INFO_BOX_VOLUME_SLIDER_WIDTH / 2,
                -INFO_BOX_VOLUME_SLIDER_HEIGHT / 2,
                INFO_BOX_VOLUME_SLIDER_WIDTH,
                INFO_BOX_VOLUME_SLIDER_HEIGHT,
                INFO_BOX_VOLUME_SLIDER_RADIUS
              );
              g.endFill();
            }}
          />

          <Graphics
            draw={(g) => {
              const fillWidth = INFO_BOX_VOLUME_SLIDER_WIDTH * infoBoxVolumeValues[volumeButtonIndex];
              g.clear();
              if (fillWidth <= 0) return;
              g.beginFill(INFO_BOX_VOLUME_SLIDER_FILL_COLOR, 1);
              g.drawRoundedRect(
                -INFO_BOX_VOLUME_SLIDER_WIDTH / 2,
                -INFO_BOX_VOLUME_SLIDER_HEIGHT / 2,
                fillWidth,
                INFO_BOX_VOLUME_SLIDER_HEIGHT,
                Math.min(INFO_BOX_VOLUME_SLIDER_RADIUS, fillWidth / 2)
              );
              g.endFill();
            }}
          />

          <Graphics
            x={-INFO_BOX_VOLUME_SLIDER_WIDTH / 2 + INFO_BOX_VOLUME_SLIDER_WIDTH * infoBoxVolumeValues[volumeButtonIndex]}
            draw={(g) => {
              g.clear();
              g.beginFill(0xffffff, 1);
              g.drawRoundedRect(
                -INFO_BOX_VOLUME_SLIDER_KNOB_WIDTH / 2,
                -INFO_BOX_VOLUME_SLIDER_KNOB_HEIGHT / 2,
                INFO_BOX_VOLUME_SLIDER_KNOB_WIDTH,
                INFO_BOX_VOLUME_SLIDER_KNOB_HEIGHT,
                INFO_BOX_VOLUME_SLIDER_KNOB_RADIUS
              );
              g.endFill();
            }}
          />

          <Rectangle
            width={INFO_BOX_VOLUME_SLIDER_WIDTH + INFO_BOX_VOLUME_SLIDER_KNOB_WIDTH}
            height={INFO_BOX_VOLUME_SLIDER_KNOB_HEIGHT}
            anchor={{ x: 0.5, y: 0.5 }}
            backgroundAlpha={0}
            eventMode="static"
            cursor="pointer"
            onpointerdown={(event) => startInfoBoxVolumeDrag(volumeButtonIndex, event)}
            onpointermove={(event) => dragInfoBoxVolume(volumeButtonIndex, event)}
            onpointerup={(event) => stopInfoBoxVolumeDrag(volumeButtonIndex, event)}
            onpointerupoutside={(event) => stopInfoBoxVolumeDrag(volumeButtonIndex, event)}
          />
        </Container>
      </Container>
      {/if}
    {/each}
  </Container>
{/if}
